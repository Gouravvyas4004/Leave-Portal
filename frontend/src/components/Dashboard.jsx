import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeavesRequest } from '../store/leaveSlice'
import LeaveForm from './LeaveForm'
import LeaveTable from './LeaveTable'
import AdminDashboard from './AdminDashboard'
import { Typography, Container, Grid, Card, CardContent, Box } from '@mui/material'
import DateRangeIcon from '@mui/icons-material/DateRange';

import KpiCard from './KpiCard'

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector(s => s.user.user)
  const balance = useSelector(s => s.leaves.balance)
  // Assuming 'items' are in state to count pending
  const leaves = useSelector(s => s.leaves.items) || []
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  useEffect(() => {
    if (user && !['manager', 'admin'].includes(user.role)) {
      dispatch(fetchLeavesRequest({ userId: user.id }))
      dispatch({ type: 'leaves/fetchBalanceRequest', payload: { userId: user.id } })
    } else if (user) {
      dispatch(fetchLeavesRequest({}))
    }
  }, [user, dispatch])

  if (user && ['manager', 'admin'].includes(user.role)) return <AdminDashboard />

  return (
    <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">My Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Manage your leave applications and history.</Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <KpiCard title="Available Balance" value={balance ?? '-'} subtext="Annual Leave Days" />
          </Grid>
          <Grid item xs={12} md={4}>
             <KpiCard title="Pending Requests" value={pendingCount} subtext="Awaiting Manager Approval" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
               <DateRangeIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
               <Box>
                 <Typography variant="h6">Plan Ahead</Typography>
                 <Typography variant="caption" sx={{ opacity: 0.8 }}>Apply for leaves early to ensure team availability.</Typography>
               </Box>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={4}>
            <LeaveForm />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent History</Typography>
            <LeaveTable />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}