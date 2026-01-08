import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeavesRequest, approveLeaveRequest, rejectLeaveRequest } from '../store/leaveSlice'
import { fetchUsersRequest, fetchUserDetailsRequest } from '../store/usersSlice'
import LeaveTable from './LeaveTable'
import UserDetails from './UserDetails'
import ApprovalGrid from './ApprovalGrid'
import { 
  Box, Typography, Container, Dialog, DialogTitle, DialogContent, 
  TextField, DialogActions, Grid, List, ListItemButton, 
  ListItemAvatar, Avatar, ListItemText, Paper, Button, Divider, Chip, Tabs, Tab, IconButton, Collapse
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import KpiCard from './KpiCard';

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const users = useSelector(s => s.adminUsers.list)
  const selected = useSelector(s => s.adminUsers.selected)
  const leaves = useSelector(s => s.leaves.items) || []
  const [open, setOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [reason, setReason] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [employeeListExpanded, setEmployeeListExpanded] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showAllEmployees, setShowAllEmployees] = useState(false);

  // Filter employees based on search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  // Show only 4 employees by default unless searching or expanded
  const displayedUsers = (showAllEmployees || employeeSearch) ? filteredUsers : filteredUsers.slice(0, 4);

  // KPI counts
  const totalEmployees = users.length
  const totalRequests = leaves.length
  const pendingCount = leaves.filter(l => l.status === 'pending').length
  const approvedCount = leaves.filter(l => l.status === 'approved').length
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length

  useEffect(() => {
    dispatch(fetchLeavesRequest({ force: true }))
    dispatch(fetchUsersRequest())
    
    // Periodically refresh leaves to ensure history is always updated
    const interval = setInterval(() => {
      dispatch(fetchLeavesRequest({ force: true }))
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [dispatch])

  const handleUserClick = (userId, index) => {
    // If clicking the same employee again, deselect them
    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(index);
    dispatch(fetchUserDetailsRequest({ id: userId }));
  };

  const handleOpen = (row, type) => { setSelectedLeave(row); setActionType(type); setOpen(true); setReason('') }
  const handleClose = () => { setOpen(false); setSelectedLeave(null); setActionType(null); setReason('') }
  
  const handleSubmit = () => {
    if (!selectedLeave) return;
    const action = actionType === 'approve' ? approveLeaveRequest : rejectLeaveRequest;
    dispatch(action({ id: selectedLeave._id || selectedLeave.id, reason }))
    handleClose()
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 3, mb: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" fontWeight="bold" color="#1e293b">Manager Portal</Typography>
          <Typography variant="body2" color="text.secondary">Overview of team performance and leave requests</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Sidebar: Employee List */}
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              {/* Header */}
              <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: '#3b82f6' }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b' }}>Employees</Typography>
                  <Chip label={users.length} size="small" variant="outlined" sx={{ ml: 0.5 }} />
                </Box>
              </Box>

              {/* Search Field */}
              {users.length > 0 && (
                <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: 'white' }}>
                  <TextField
                    fullWidth
                    placeholder="Search employees..."
                    size="small"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.disabled', fontSize: 20 }} />,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        bgcolor: '#f8fafc',
                        '&:hover': { bgcolor: '#f1f5f9' }
                      }
                    }}
                  />
                </Box>
              )}

              {/* Employee List */}
              {users.length === 0 ? (
                <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No employees found.</Typography>
                </Box>
              ) : filteredUsers.length === 0 ? (
                <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No results found.</Typography>
                </Box>
              ) : (
                <>
                  <List sx={{ maxHeight: 'none', overflow: 'visible' }}>
                    {displayedUsers.map((u, i) => {
                      const originalIndex = users.findIndex(user => user._id === u._id);
                      return (
                        <React.Fragment key={u._id}>
                          <ListItemButton 
                            selected={selectedIndex === originalIndex}
                            onClick={() => handleUserClick(u._id, originalIndex)}
                            sx={{ 
                              py: 1.5,
                              px: 2,
                              '&.Mui-selected': { 
                                bgcolor: '#eff6ff', 
                                borderRight: '4px solid #3b82f6',
                                '&:hover': { bgcolor: '#dbeafe' }
                              },
                              '&:hover': {
                                bgcolor: '#f8fafc'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: selectedIndex === originalIndex ? 'primary.main' : '#e2e8f0',
                                color: selectedIndex === originalIndex ? 'white' : '#64748b',
                                fontWeight: 'bold',
                                width: 40,
                                height: 40
                              }}>
                                {u.name?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={<Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>{u.name}</Typography>} 
                              secondary={<Typography variant="caption" sx={{ color: '#64748b', textTransform: 'capitalize' }}>{u.role}</Typography>} 
                            />
                          </ListItemButton>
                          <Divider component="li" sx={{ my: 0.5 }} />
                        </React.Fragment>
                      );
                    })}
                  </List>

                  {/* View More Button */}
                  {!employeeSearch && filteredUsers.length > 4 && !showAllEmployees && (
                    <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc', textAlign: 'center' }}>
                      <Button 
                        size="small" 
                        onClick={() => setShowAllEmployees(true)}
                        sx={{ 
                          color: '#3b82f6', 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#eff6ff' }
                        }}
                      >
                        View More ({filteredUsers.length - 4} more)
                      </Button>
                    </Box>
                  )}

                  {/* Show Less Button */}
                  {showAllEmployees && (
                    <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc', textAlign: 'center' }}>
                      <Button 
                        size="small" 
                        onClick={() => setShowAllEmployees(false)}
                        sx={{ 
                          color: '#3b82f6', 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#eff6ff' }
                        }}
                      >
                        Show Less
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {/* KPI Cards - Always visible */}
              <Grid item xs={12}>
                <Box sx={{ position: 'sticky', top: 16, zIndex: 1, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <KpiCard title="Employees" value={totalEmployees} icon={<PeopleIcon />} subtext="Total employees" />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <KpiCard title="Open Requests" value={pendingCount} icon={<HourglassEmptyIcon />} color="warning" subtext="Pending approval" />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <KpiCard title="Approved" value={approvedCount} icon={<CheckCircleIcon />} color="success" subtext="Approved requests" />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <KpiCard title="Rejected" value={rejectedCount} icon={<CancelIcon />} color="error" subtext="Declined requests" />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* All Leave Requests - Only show if no employee is selected */}
              {selectedIndex === null && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 3, borderTop: '4px solid #3b82f6' }} elevation={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">All Leave Requests</Typography>
                      <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} size="small" textColor="primary" indicatorColor="primary">
                        <Tab label={`Pending (${leaves.filter(l => l.status === 'pending').length})`} value="pending" />
                        <Tab label={`Approved (${leaves.filter(l => l.status === 'approved').length})`} value="approved" />
                        <Tab label={`Rejected (${leaves.filter(l => l.status === 'rejected').length})`} value="rejected" />
                        <Tab label={`All (${leaves.length})`} value="all" />
                      </Tabs>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <ApprovalGrid items={selectedTab === 'all' ? leaves : leaves.filter(l => l.status === selectedTab)} status={selectedTab} onApprove={(row) => handleOpen(row, 'approve')} onReject={(row) => handleOpen(row, 'reject')} />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Detailed view</Typography>
                      <LeaveTable adminView items={selectedTab === 'all' ? leaves : leaves.filter(l => l.status === selectedTab)} onApprove={(row) => handleOpen(row, 'approve')} onReject={(row) => handleOpen(row, 'reject')} />
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Selected Employee Details - Show when employee is selected */}
              {selectedIndex !== null && selected && (
                <Grid item xs={12}>
                  <UserDetails user={selected.user} leaves={selected.leaves || []} />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Action Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: actionType === 'approve' ? '#ecfdf5' : '#fef2f2', color: actionType === 'approve' ? '#065f46' : '#991b1b' }}>
          {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Please provide a reason or note for the employee (Optional).
          </Typography>
          <TextField fullWidth multiline rows={3} label="Manager Remarks" variant="outlined" value={reason} onChange={e => setReason(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}