import React, { useEffect, useState } from 'react';
import AdminSideNav from './SideNav/adminSideNav';
import { FaTrash, FaUsers, FaBoxOpen, FaHistory, FaChartPie, FaUserTie, FaDownload, FaFilePdf } from 'react-icons/fa';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const statusColors = {
  FULL: 'bg-red-100 text-red-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  EMPTY: 'bg-green-100 text-green-700',
};

const pdfStyles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: 'bold' },
  statValue: { fontSize: 12 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', marginBottom: 12 },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f0f0f0' },
  tableCell: { padding: 5, borderWidth: 1, borderColor: '#bfbfbf', fontSize: 10 },
  headerCell: { fontWeight: 'bold' },
});

const AnalyticsPDF = ({ report }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Admin Analytics Report</Text>
      {/* Key Stats */}
      <View style={pdfStyles.section}>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Total Bins:</Text><Text style={pdfStyles.statValue}>{report.totalBins}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Total Collections:</Text><Text style={pdfStyles.statValue}>{report.totalCollections}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Collections Last 7 Days:</Text><Text style={pdfStyles.statValue}>{report.collectionsLast7Days}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Total Users:</Text><Text style={pdfStyles.statValue}>{report.totalUsers}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>New Users This Month:</Text><Text style={pdfStyles.statValue}>{report.usersThisMonth}</Text></View>
        <View style={pdfStyles.statRow}><Text style={pdfStyles.statLabel}>Average Fill Level:</Text><Text style={pdfStyles.statValue}>{report.avgFillLevel ? report.avgFillLevel.toFixed(1) : 0}%</Text></View>
      </View>
      {/* Bins by Status */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Bins by Status</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Status</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Count</Text>
        </View>
        {report.binsByStatus && report.binsByStatus.map((b) => (
          <View key={b.status} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{b.status}</Text>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{b._count?.status || 0}</Text>
          </View>
        ))}
      </View>
      {/* Users by Role */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Users by Role</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Role</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '50%' }]}>Count</Text>
        </View>
        {report.usersByRole && report.usersByRole.map((r) => (
          <View key={r.role} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{r.role}</Text>
            <Text style={[pdfStyles.tableCell, { width: '50%' }]}>{r._count?.role || 0}</Text>
          </View>
        ))}
      </View>
      {/* Most Active Collector */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Most Active Collector</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '40%' }]}>Name</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '40%' }]}>Email</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '20%' }]}>Collections</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={[pdfStyles.tableCell, { width: '40%' }]}>{report.mostActiveCollector ? report.mostActiveCollector.name : 'N/A'}</Text>
          <Text style={[pdfStyles.tableCell, { width: '40%' }]}>{report.mostActiveCollector ? report.mostActiveCollector.email : 'N/A'}</Text>
          <Text style={[pdfStyles.tableCell, { width: '20%' }]}>{report.mostActiveCollector ? report.mostActiveCollector.collections : 0}</Text>
        </View>
      </View>
      {/* Recent Collections */}
      <Text style={{ fontSize: 14, marginBottom: 4, fontWeight: 'bold' }}>Recent Collections</Text>
      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '25%' }]}>Bin ID</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '45%' }]}>Collected By</Text>
          <Text style={[pdfStyles.tableCell, pdfStyles.headerCell, { width: '30%' }]}>Date & Time</Text>
        </View>
        {report.recentCollections && report.recentCollections.map((rc) => (
          <View key={rc.id} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '25%' }]}>{`#${rc.binId}`}</Text>
            <Text style={[pdfStyles.tableCell, { width: '45%' }]}>{rc.collectedBy?.name || 'Unknown'}</Text>
            <Text style={[pdfStyles.tableCell, { width: '30%' }]}>{new Date(rc.collectedAt).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const Analytics = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnlyDelayed, setShowOnlyDelayed] = useState(false);
  const [daysFilter, setDaysFilter] = useState('all');
  const [paymentReport, setPaymentReport] = useState(null);
  
  // Payment filters
  const [paymentDateFilter, setPaymentDateFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentAmountFilter, setPaymentAmountFilter] = useState('all');
  const [paymentUserFilter, setPaymentUserFilter] = useState('');
  const [paymentCompanyFilter, setPaymentCompanyFilter] = useState('');
  
  // Collection filters
  const [collectionCollectorFilter, setCollectionCollectorFilter] = useState('all');
  const [collectionBinStatusFilter, setCollectionBinStatusFilter] = useState('all');
  const [showCollectionDownloadMenu, setShowCollectionDownloadMenu] = useState(false);

  // Clear all filters function
  const clearAllFilters = () => {
    setPaymentDateFilter('all');
    setPaymentStatusFilter('all');
    setPaymentAmountFilter('all');
    setPaymentUserFilter('');
    setPaymentCompanyFilter('');
    setCollectionCollectorFilter('all');
    setCollectionBinStatusFilter('all');
    setDaysFilter('all');
    setShowOnlyDelayed(false);
  };

  // Download filtered data functions
  const downloadFilteredPayments = () => {
    if (filteredPayments.length === 0) {
      alert('No payments to download');
      return;
    }

    const csvContent = [
      // CSV Header
      ['ID', 'Amount', 'Status', 'User', 'Company', 'Date', 'Reference ID', 'Phone Number'].join(','),
      // CSV Data
      ...filteredPayments.map(p => [
        p.id,
        p.amount,
        p.status,
        p.user ? p.user.name : '',
        p.company ? p.company.name : '',
        new Date(p.createdAt).toLocaleString(),
        p.referenceId || '',
        p.phoneNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFilteredCollections = () => {
    const collectionsToDownload = showOnlyDelayed 
      ? finalFilteredCollections.filter(rc => rc.delayed)
      : finalFilteredCollections;

    if (collectionsToDownload.length === 0) {
      alert('No collections to download');
      return;
    }

    const csvContent = [
      // CSV Header
      ['Bin ID', 'Collected By', 'Date & Time', 'Delay', 'Delay Days', 'Notes'].join(','),
      // CSV Data
      ...collectionsToDownload.map(rc => [
        rc.binId,
        rc.collectedBy ? rc.collectedBy.name : 'Unknown',
        new Date(rc.collectedAt).toLocaleString(),
        rc.delayed ? 'Delayed' : 'On Time',
        rc.delayDays || '',
        rc.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_collections_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Additional collection download functions
  const downloadCollectionsByCollector = () => {
    const collectionsToDownload = showOnlyDelayed 
      ? finalFilteredCollections.filter(rc => rc.delayed)
      : finalFilteredCollections;

    if (collectionsToDownload.length === 0) {
      alert('No collections to download');
      return;
    }

    // Group by collector
    const groupedByCollector = collectionsToDownload.reduce((acc, rc) => {
      const collectorName = rc.collectedBy ? rc.collectedBy.name : 'Unknown';
      if (!acc[collectorName]) {
        acc[collectorName] = [];
      }
      acc[collectorName].push(rc);
      return acc;
    }, {});

    let reportContent = `Collections Report by Collector\n`;
    reportContent += `Generated on: ${new Date().toLocaleString()}\n`;
    reportContent += `Total Collections: ${collectionsToDownload.length}\n\n`;

    Object.entries(groupedByCollector).forEach(([collector, collections]) => {
      reportContent += `=== ${collector} ===\n`;
      reportContent += `Total Collections: ${collections.length}\n`;
      reportContent += `Delayed Collections: ${collections.filter(c => c.delayed).length}\n`;
      reportContent += `On Time Collections: ${collections.filter(c => !c.delayed).length}\n\n`;
      
      reportContent += `Details:\n`;
      reportContent += `Bin ID,Date & Time,Delay,Delay Days,Notes\n`;
      collections.forEach(rc => {
        reportContent += `${rc.binId},${new Date(rc.collectedAt).toLocaleString()},${rc.delayed ? 'Delayed' : 'On Time'},${rc.delayDays || ''},${rc.notes || ''}\n`;
      });
      reportContent += '\n';
    });

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collections_by_collector_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDelayedCollectionsOnly = () => {
    const delayedCollections = finalFilteredCollections.filter(rc => rc.delayed);

    if (delayedCollections.length === 0) {
      alert('No delayed collections found');
      return;
    }

    const csvContent = [
      // CSV Header
      ['Bin ID', 'Collected By', 'Date & Time', 'Delay Days', 'Notes', 'Request Date'].join(','),
      // CSV Data
      ...delayedCollections.map(rc => [
        rc.binId,
        rc.collectedBy ? rc.collectedBy.name : 'Unknown',
        new Date(rc.collectedAt).toLocaleString(),
        rc.delayDays || '',
        rc.notes || '',
        rc.collectionRequest ? new Date(rc.collectionRequest.createdAt).toLocaleString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `delayed_collections_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCollectionsSummary = () => {
    const collectionsToDownload = showOnlyDelayed 
      ? finalFilteredCollections.filter(rc => rc.delayed)
      : finalFilteredCollections;

    if (collectionsToDownload.length === 0) {
      alert('No collections to download');
      return;
    }

    // Calculate summary statistics
    const totalCollections = collectionsToDownload.length;
    const delayedCollections = collectionsToDownload.filter(rc => rc.delayed).length;
    const onTimeCollections = totalCollections - delayedCollections;
    const avgDelayDays = delayedCollections > 0 
      ? (collectionsToDownload.filter(rc => rc.delayed).reduce((sum, rc) => sum + (rc.delayDays || 0), 0) / delayedCollections).toFixed(2)
      : 0;

    // Group by date
    const groupedByDate = collectionsToDownload.reduce((acc, rc) => {
      const date = new Date(rc.collectedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(rc);
      return acc;
    }, {});

    let reportContent = `Collections Summary Report\n`;
    reportContent += `Generated on: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    reportContent += `SUMMARY STATISTICS:\n`;
    reportContent += `Total Collections: ${totalCollections}\n`;
    reportContent += `On Time Collections: ${onTimeCollections}\n`;
    reportContent += `Delayed Collections: ${delayedCollections}\n`;
    reportContent += `Delay Rate: ${((delayedCollections / totalCollections) * 100).toFixed(1)}%\n`;
    reportContent += `Average Delay (days): ${avgDelayDays}\n\n`;

    reportContent += `COLLECTIONS BY DATE:\n`;
    Object.entries(groupedByDate).forEach(([date, collections]) => {
      const dateDelayed = collections.filter(c => c.delayed).length;
      reportContent += `${date}: ${collections.length} collections (${dateDelayed} delayed)\n`;
    });
    reportContent += '\n';

    reportContent += `DETAILED LIST:\n`;
    reportContent += `Date,Bin ID,Collector,Delay,Delay Days\n`;
    collectionsToDownload.forEach(rc => {
      reportContent += `${new Date(rc.collectedAt).toLocaleDateString()},${rc.binId},${rc.collectedBy ? rc.collectedBy.name : 'Unknown'},${rc.delayed ? 'Delayed' : 'On Time'},${rc.delayDays || ''}\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collections_summary_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCollectionsExcel = () => {
    const collectionsToDownload = showOnlyDelayed 
      ? finalFilteredCollections.filter(rc => rc.delayed)
      : finalFilteredCollections;

    if (collectionsToDownload.length === 0) {
      alert('No collections to download');
      return;
    }

    // Create Excel-like format with multiple sheets
    let excelContent = `Collections Report - Excel Format\n`;
    excelContent += `Generated on: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    // Sheet 1: All Collections
    excelContent += `=== SHEET 1: ALL COLLECTIONS ===\n`;
    excelContent += `Bin ID\tCollected By\tDate & Time\tDelay\tDelay Days\tNotes\tBin Status\tRequest ID\n`;
    collectionsToDownload.forEach(rc => {
      excelContent += `${rc.binId}\t${rc.collectedBy ? rc.collectedBy.name : 'Unknown'}\t${new Date(rc.collectedAt).toLocaleString()}\t${rc.delayed ? 'Delayed' : 'On Time'}\t${rc.delayDays || ''}\t${rc.notes || ''}\t${rc.bin?.status || ''}\t${rc.collectionRequest?.id || ''}\n`;
    });
    excelContent += '\n';

    // Sheet 2: Delayed Collections Only
    const delayedCollections = collectionsToDownload.filter(rc => rc.delayed);
    if (delayedCollections.length > 0) {
      excelContent += `=== SHEET 2: DELAYED COLLECTIONS ===\n`;
      excelContent += `Bin ID\tCollected By\tDate & Time\tDelay Days\tNotes\tRequest Date\n`;
      delayedCollections.forEach(rc => {
        excelContent += `${rc.binId}\t${rc.collectedBy ? rc.collectedBy.name : 'Unknown'}\t${new Date(rc.collectedAt).toLocaleString()}\t${rc.delayDays || ''}\t${rc.notes || ''}\t${rc.collectionRequest ? new Date(rc.collectionRequest.createdAt).toLocaleString() : ''}\n`;
      });
      excelContent += '\n';
    }

    // Sheet 3: Summary by Collector
    const groupedByCollector = collectionsToDownload.reduce((acc, rc) => {
      const collectorName = rc.collectedBy ? rc.collectedBy.name : 'Unknown';
      if (!acc[collectorName]) {
        acc[collectorName] = [];
      }
      acc[collectorName].push(rc);
      return acc;
    }, {});

    excelContent += `=== SHEET 3: SUMMARY BY COLLECTOR ===\n`;
    excelContent += `Collector\tTotal Collections\tOn Time\tDelayed\tDelay Rate (%)\n`;
    Object.entries(groupedByCollector).forEach(([collector, collections]) => {
      const delayed = collections.filter(c => c.delayed).length;
      const onTime = collections.length - delayed;
      const delayRate = ((delayed / collections.length) * 100).toFixed(1);
      excelContent += `${collector}\t${collections.length}\t${onTime}\t${delayed}\t${delayRate}\n`;
    });

    const blob = new Blob([excelContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collections_excel_format_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFilteredData = () => {
    const hasPayments = filteredPayments.length > 0;
    const hasCollections = finalFilteredCollections.length > 0;

    if (!hasPayments && !hasCollections) {
      alert('No data to download');
      return;
    }

    // Create a combined report
    let reportContent = `Admin Analytics Filtered Report\n`;
    reportContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    // Add filter summary
    reportContent += `FILTER SUMMARY:\n`;
    reportContent += `Payment Date Filter: ${paymentDateFilter}\n`;
    reportContent += `Payment Status Filter: ${paymentStatusFilter}\n`;
    reportContent += `Payment Amount Filter: ${paymentAmountFilter}\n`;
    reportContent += `Payment User Search: ${paymentUserFilter || 'None'}\n`;
    reportContent += `Payment Company Search: ${paymentCompanyFilter || 'None'}\n`;
    reportContent += `Collection Days Filter: ${daysFilter}\n`;
    reportContent += `Collection Collector Filter: ${collectionCollectorFilter}\n`;
    reportContent += `Collection Bin Status Filter: ${collectionBinStatusFilter}\n`;
    reportContent += `Show Only Delayed Collections: ${showOnlyDelayed}\n\n`;

    // Add payment data
    if (hasPayments) {
      reportContent += `PAYMENTS (${filteredPayments.length} records):\n`;
      reportContent += `ID,Amount,Status,User,Company,Date,Reference ID,Phone Number\n`;
      filteredPayments.forEach(p => {
        reportContent += `${p.id},${p.amount},${p.status},${p.user ? p.user.name : ''},${p.company ? p.company.name : ''},${new Date(p.createdAt).toLocaleString()},${p.referenceId || ''},${p.phoneNumber || ''}\n`;
      });
      reportContent += '\n';
    }

    // Add collection data
    if (hasCollections) {
      const collectionsToInclude = showOnlyDelayed 
        ? finalFilteredCollections.filter(rc => rc.delayed)
        : finalFilteredCollections;

      reportContent += `COLLECTIONS (${collectionsToInclude.length} records):\n`;
      reportContent += `Bin ID,Collected By,Date & Time,Delay,Delay Days,Notes\n`;
      collectionsToInclude.forEach(rc => {
        reportContent += `${rc.binId},${rc.collectedBy ? rc.collectedBy.name : 'Unknown'},${new Date(rc.collectedAt).toLocaleString()},${rc.delayed ? 'Delayed' : 'On Time'},${rc.delayDays || ''},${rc.notes || ''}\n`;
      });
    }

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_analytics_filtered_report_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetch('http://localhost:5000/analytics/report')
      .then(res => res.json())
      .then(data => {
        // Ensure all required arrays exist with default values
        const safeData = {
          totalBins: data.totalBins || 0,
          totalCollections: data.totalCollections || 0,
          collectionsLast7Days: data.collectionsLast7Days || 0,
          totalUsers: data.totalUsers || 0,
          usersThisMonth: data.usersThisMonth || 0,
          avgFillLevel: data.avgFillLevel || 0,
          binsByStatus: data.binsByStatus || [],
          usersByRole: data.usersByRole || [],
          recentCollections: data.recentCollections || [],
          mostActiveCollector: data.mostActiveCollector || null,
          collectionsByDay: data.collectionsByDay || []
        };
        setReport(safeData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setError('Failed to fetch analytics report');
        setLoading(false);
      });
    // Fetch payment report
    fetch('http://localhost:5000/api/payments/admin-report', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setPaymentReport(data))
      .catch(err => console.error('Payment report fetch error:', err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCollectionDownloadMenu && !event.target.closest('.relative')) {
        setShowCollectionDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCollectionDownloadMenu]);

  // Prepare data for the timeline chart
  const timelineData = {
    labels: report?.collectionsByDay?.map(d => new Date(d.collectedAt || d.date_trunc).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Collections per Day',
        data: report?.collectionsByDay?.map(d => d._count?.id || 0) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  // Compute dynamic filter options based on collection dates
  const collectionDates = (report?.recentCollections || []).map(rc => new Date(rc.collectedAt));
  const now = new Date();
  // Get unique day differences
  const uniqueDayDiffs = Array.from(new Set(collectionDates.map(date => Math.floor((now - date) / (1000 * 60 * 60 * 24))))).sort((a, b) => a - b);
  // Build options: always include 'All', then each unique day difference as 'Last X days'
  const filterOptions = [{ value: 'all', label: 'All' }];
  uniqueDayDiffs.forEach(days => {
    if (days === 0) {
      filterOptions.push({ value: 1, label: 'Today' });
    } else {
      filterOptions.push({ value: days + 1, label: `Last ${days + 1} days` });
    }
  });
  // Remove duplicates in label
  const seen = new Set();
  const finalFilterOptions = filterOptions.filter(opt => {
    if (seen.has(opt.label)) return false;
    seen.add(opt.label);
    return true;
  });

  // Filter recent collections by selected days
  const filteredCollections = (report?.recentCollections || []).filter(rc => {
    if (daysFilter === 'all') return true;
    if (daysFilter === 'today') {
      const collectedAt = new Date(rc.collectedAt);
      const today = new Date();
      return collectedAt.toDateString() === today.toDateString();
    }
    const collectedAt = new Date(rc.collectedAt);
    return (now - collectedAt) / (1000 * 60 * 60 * 24) <= Number(daysFilter);
  });

  // Filter payments based on selected criteria
  const filteredPayments = (paymentReport?.recentPayments || []).filter(payment => {
    // Date filter
    if (paymentDateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const daysDiff = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
      if (paymentDateFilter === 'today' && daysDiff !== 0) return false;
      if (paymentDateFilter === 'week' && daysDiff > 7) return false;
      if (paymentDateFilter === 'month' && daysDiff > 30) return false;
    }

    // Status filter
    if (paymentStatusFilter !== 'all' && payment.status !== paymentStatusFilter) {
      return false;
    }

    // Amount filter
    if (paymentAmountFilter !== 'all') {
      const amount = parseFloat(payment.amount);
      if (paymentAmountFilter === 'low' && amount >= 1000) return false;
      if (paymentAmountFilter === 'medium' && (amount < 1000 || amount >= 5000)) return false;
      if (paymentAmountFilter === 'high' && amount < 5000) return false;
    }

    // User filter
    if (paymentUserFilter && payment.user && !payment.user.name.toLowerCase().includes(paymentUserFilter.toLowerCase())) {
      return false;
    }

    // Company filter
    if (paymentCompanyFilter && payment.company && !payment.company.name.toLowerCase().includes(paymentCompanyFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Get unique collectors for collection filter
  const uniqueCollectors = Array.from(new Set(
    (report?.recentCollections || [])
      .map(rc => rc.collectedBy?.name)
      .filter(name => name)
  )).sort();

  // Filter collections by additional criteria
  const finalFilteredCollections = filteredCollections.filter(rc => {
    // Collector filter
    if (collectionCollectorFilter !== 'all' && rc.collectedBy?.name !== collectionCollectorFilter) {
      return false;
    }

    // Bin status filter (if available)
    if (collectionBinStatusFilter !== 'all' && rc.bin?.status !== collectionBinStatusFilter) {
      return false;
    }

    return true;
  });

  if (loading) return <div className="flex h-screen"><AdminSideNav /><div className="flex-1 flex items-center justify-center text-lg">Loading analytics...</div></div>;
  if (error) return <div className="flex h-screen"><AdminSideNav /><div className="flex-1 flex items-center justify-center text-red-600 text-lg">{error}</div></div>;
  if (!report) return <div className="flex h-screen"><AdminSideNav /><div className="flex-1 flex items-center justify-center text-lg">No analytics data available.</div></div>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-50">
      <AdminSideNav />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
            <div className="flex gap-2">
              <PDFDownloadLink document={<AnalyticsPDF report={report} />} fileName="analytics_report.pdf" className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition-all duration-200">
                {({ loading }) => (<><FaFilePdf className="mr-2" />{loading ? 'Generating...' : 'Download PDF'}</>)}
              </PDFDownloadLink>
            </div>
          </div>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <FaBoxOpen className="text-3xl text-blue-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Bins</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalBins}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <FaHistory className="text-3xl text-green-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Collections</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalCollections}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days: <span className="font-semibold text-gray-700">{report.collectionsLast7Days}</span></p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <FaUsers className="text-3xl text-purple-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{report.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">New this month: <span className="font-semibold text-gray-700">{report.usersThisMonth}</span></p>
              </div>
            </div>
          </div>

          {/* More Specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Bins by Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaChartPie className="mr-2 text-blue-400" />Bins by Status</h2>
              <ul className="space-y-2">
                {report.binsByStatus && report.binsByStatus.length > 0 ? (
                  report.binsByStatus.map((b) => (
                    <li key={b.status} className={`flex items-center justify-between px-4 py-2 rounded ${statusColors[b.status] || 'bg-gray-100 text-gray-700'}`}>
                      <span className="font-medium">{b.status}</span>
                      <span className="font-bold">{b._count?.status || 0}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-2">No bin status data available</li>
                )}
              </ul>
            </div>
            {/* Users by Role */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaUserTie className="mr-2 text-purple-400" />Users by Role</h2>
              <ul className="space-y-2">
                {report.usersByRole && report.usersByRole.length > 0 ? (
                  report.usersByRole.map((r) => (
                    <li key={r.role} className="flex items-center justify-between px-4 py-2 rounded bg-gray-100 text-gray-700">
                      <span className="font-medium">{r.role}</span>
                      <span className="font-bold">{r._count?.role || 0}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-2">No user role data available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Average Fill Level & Most Active Collector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaBoxOpen className="mr-2 text-blue-400" />Average Bin Fill Level</h2>
              <span className="text-3xl font-bold text-blue-700">{report.avgFillLevel ? report.avgFillLevel.toFixed(1) : 0}%</span>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FaUsers className="mr-2 text-green-400" />Most Active Collector</h2>
              {report.mostActiveCollector ? (
                <div>
                  <p className="font-bold text-lg text-gray-800">{report.mostActiveCollector.name}</p>
                  <p className="text-gray-600 text-sm">{report.mostActiveCollector.email}</p>
                  <p className="text-gray-700 mt-1">Collections: <span className="font-semibold">{report.mostActiveCollector.collections}</span></p>
                </div>
              ) : (
                <p className="text-gray-500">No collections yet.</p>
              )}
            </div>
          </div>

          {/* Payment Report Section */}
          {paymentReport && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">Payment Report</h2>
                <div className="flex gap-2 items-center">
                  {/* Payment Filters */}
                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">Date:</label>
                    <select
                      value={paymentDateFilter}
                      onChange={e => setPaymentDateFilter(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">Status:</label>
                    <select
                      value={paymentStatusFilter}
                      onChange={e => setPaymentStatusFilter(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">Amount:</label>
                    <select
                      value={paymentAmountFilter}
                      onChange={e => setPaymentAmountFilter(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Amounts</option>
                      <option value="low">Low (&lt; 1,000)</option>
                      <option value="medium">Medium (1,000 - 5,000)</option>
                      <option value="high">High (&gt; 5,000)</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">User:</label>
                    <input
                      type="text"
                      placeholder="Search user..."
                      value={paymentUserFilter}
                      onChange={e => setPaymentUserFilter(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                    />
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600">Company:</label>
                    <input
                      type="text"
                      placeholder="Search company..."
                      value={paymentCompanyFilter}
                      onChange={e => setPaymentCompanyFilter(e.target.value)}
                      className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col items-start">
                  <span className="text-gray-500 text-sm">Total Payments</span>
                  <span className="text-2xl font-bold text-gray-800">{paymentReport.totalPayments}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-500 text-sm">Total Amount</span>
                  <span className="text-2xl font-bold text-green-700">{paymentReport.totalAmount}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-500 text-sm">Payments by Status</span>
                  <ul className="mt-1">
                    {(paymentReport.paymentsByStatus || []).map(s => (
                      <li key={s.status} className="text-sm text-gray-700">
                        <span className="font-semibold">{s.status}:</span> {s._count.status} ({s._sum.amount})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Filter Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-6">
                    <div className="text-sm">
                      <span className="text-gray-600">Showing:</span>
                      <span className="font-semibold ml-1">{filteredPayments.length}</span>
                      <span className="text-gray-600 ml-1">of {paymentReport.recentPayments?.length || 0} payments</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Collections:</span>
                      <span className="font-semibold ml-1">{finalFilteredCollections.length}</span>
                      <span className="text-gray-600 ml-1">of {report?.recentCollections?.length || 0} total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500">
                      {paymentDateFilter !== 'all' && `Date: ${paymentDateFilter}`}
                      {paymentStatusFilter !== 'all' && ` | Status: ${paymentStatusFilter}`}
                      {paymentAmountFilter !== 'all' && ` | Amount: ${paymentAmountFilter}`}
                      {(paymentUserFilter || paymentCompanyFilter) && ` | Search: ${paymentUserFilter || paymentCompanyFilter}`}
                    </div>
                    <div className="flex gap-2">
                      {filteredPayments.length > 0 && (
                        <button
                          onClick={downloadFilteredPayments}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          title="Download filtered payments as CSV"
                        >
                          📊 Payments CSV
                        </button>
                      )}
                      {finalFilteredCollections.length > 0 && (
                        <button
                          onClick={downloadFilteredCollections}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          title="Download filtered collections as CSV"
                        >
                          📊 Collections CSV
                        </button>
                      )}
                      {(filteredPayments.length > 0 || finalFilteredCollections.length > 0) && (
                        <button
                          onClick={downloadAllFilteredData}
                          className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                          title="Download all filtered data as combined report"
                        >
                          📄 Full Report
                        </button>
                      )}
                      <button
                        onClick={clearAllFilters}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Recent Payments</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  Showing {filteredPayments.length} of {paymentReport.recentPayments?.length || 0} payments
                </span>
                {filteredPayments.length > 0 && (
                  <button
                    onClick={downloadFilteredPayments}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Download filtered payments as CSV"
                  >
                    📊 Download CSV
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{p.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-green-700">{p.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{p.status}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{p.user ? p.user.name : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">{p.company ? p.company.name : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(p.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No payments found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Collections Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center"><FaHistory className="mr-2 text-lg text-green-500" />Recent Collections</h2>
              <div className="flex gap-2 items-center">
                <label htmlFor="daysFilter" className="text-sm text-gray-600 mr-2">Show:</label>
                <select
                  id="daysFilter"
                  value={daysFilter}
                  onChange={e => setDaysFilter(e.target.value)}
                  className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  {finalFilterOptions.filter(opt => opt.value !== 'all').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600">Collector:</label>
                  <select
                    value={collectionCollectorFilter}
                    onChange={e => setCollectionCollectorFilter(e.target.value)}
                    className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Collectors</option>
                    {uniqueCollectors.map(collector => (
                      <option key={collector} value={collector}>{collector}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600">Bin Status:</label>
                  <select
                    value={collectionBinStatusFilter}
                    onChange={e => setCollectionBinStatusFilter(e.target.value)}
                    className="px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Status</option>
                    <option value="EMPTY">Empty</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="FULL">Full</option>
                  </select>
                </div>
                
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${showOnlyDelayed ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setShowOnlyDelayed(v => !v)}
                >
                  {showOnlyDelayed ? 'Show All' : 'Show Only Delayed'}
                </button>
                
                {finalFilteredCollections.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowCollectionDownloadMenu(!showCollectionDownloadMenu)}
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                      title="Download collection data"
                    >
                      📊 Download
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showCollectionDownloadMenu && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              downloadFilteredCollections();
                              setShowCollectionDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            📄 All Collections (CSV)
                          </button>
                          <button
                            onClick={() => {
                              downloadDelayedCollectionsOnly();
                              setShowCollectionDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            ⚠️ Delayed Only (CSV)
                          </button>
                          <button
                            onClick={() => {
                              downloadCollectionsByCollector();
                              setShowCollectionDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            👥 By Collector (Report)
                          </button>
                          <button
                            onClick={() => {
                              downloadCollectionsSummary();
                              setShowCollectionDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            📊 Summary Report
                          </button>
                          <button
                            onClick={() => {
                              downloadCollectionsExcel();
                              setShowCollectionDownloadMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            📈 Excel Format (Multi-sheet)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {finalFilteredCollections && finalFilteredCollections.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bin ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(showOnlyDelayed
                      ? finalFilteredCollections.filter(rc => rc.delayed)
                      : finalFilteredCollections
                    ).map(rc => (
                      <tr key={rc.id} className={`hover:bg-gray-50 transition-colors duration-200 ${rc.delayed ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">#{rc.binId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rc.collectedBy?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(rc.collectedAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {rc.delayed ? (
                            <span className="text-red-600 font-bold">Delayed ({rc.delayDays} days)</span>
                          ) : (
                            <span className="text-green-600">On Time</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent collections found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 