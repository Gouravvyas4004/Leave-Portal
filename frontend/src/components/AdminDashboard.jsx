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
  ListItemAvatar, Avatar, ListItemText, Paper, Button, Divider, Chip, Tabs, Tab 
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="action" />
                <Typography variant="subtitle1" fontWeight="bold">Employees</Typography>
              </Box>

              {users.length === 0 ? (
                <Box sx={{ p: 4, color: 'text.secondary' }}>
                  <Typography variant="body2">No employees found.</Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                  {users.map((u, i) => (
                    <React.Fragment key={u._id}>
                      <ListItemButton 
                        selected={selectedIndex === i}
                        onClick={() => handleUserClick(u._id, i)}
                        sx={{ '&.Mui-selected': { bgcolor: '#eff6ff', borderRight: '3px solid #3b82f6' } }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: selectedIndex === i ? 'primary.main' : 'grey.300' }}>{u.name?.[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="body2" fontWeight="600">{u.name}</Typography>} 
                          secondary={<Typography variant="caption" color="text.secondary">{u.role}</Typography>} 
                        />
                      </ListItemButton>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
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

              {selected && (
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