import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeavesRequest } from '../store/leaveSlice'
import LeaveForm from './LeaveForm'
import LeaveTable from './LeaveTable'
import AdminDashboard from './AdminDashboard'
import { Typography, Container, Grid, Card, CardContent, Box } from '@mui/material'
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventNoteIcon from '@mui/icons-material/EventNote';

import KpiCard from './KpiCard'

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector(s => s.user.user)
  const balance = useSelector(s => s.leaves.balance)
  const userBalance = useSelector(s => s.user.user?.leaveBalance)
  // Assuming 'items' are in state to count pending
  const leaves = useSelector(s => s.leaves.items) || []
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  useEffect(() => {
    if (user && !['manager', 'admin'].includes(user.role)) {
      dispatch(fetchLeavesRequest({ userId: user.id, force: true }))
      dispatch({ type: 'leaves/fetchBalanceRequest', payload: { userId: user.id, force: true } })

      // Periodically refresh balance so approved leaves reflect quickly on employee dashboard
      const interval = setInterval(() => {
        dispatch({ type: 'leaves/fetchBalanceRequest', payload: { userId: user.id, force: true } })
      }, 30000) // every 30s

      return () => clearInterval(interval)
    } else if (user) {
      dispatch(fetchLeavesRequest({ force: true }))
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
            <KpiCard title="Available Balance" value={balance ?? userBalance ?? '-'} subtext="Annual Leave Days" />
          </Grid>
          <Grid item xs={12} md={4}>
             <KpiCard title="Total Annual Leaves" value={user?.totalLeaveBalance ?? 20} icon={<EventNoteIcon />} subtext="Allocated leaves" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
               <DateRangeIcon sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
               <Box>
                 <Typography variant="h6">Pending Requests</Typography>
                 <Typography variant="h4" fontWeight="bold">{pendingCount}</Typography>
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