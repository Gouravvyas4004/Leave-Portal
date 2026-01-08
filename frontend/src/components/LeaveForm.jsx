import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { applyLeaveRequest } from '../store/leaveSlice'
import { TextField, Button, MenuItem, Paper, Typography } from '@mui/material'

const types = ['Annual', 'Sick', 'Casual']

export default function LeaveForm(){
  const dispatch = useDispatch()
  const user = useSelector(s => s.user.user)
  const [type, setType] = useState('Annual')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [days, setDays] = useState(1)

  // Calculate minimum date (today) once and memoize it
  const minDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().split('T')[0]
  }, [])

  // Handle from date change with validation
  const handleFromDateChange = (e) => {
    const selectedDate = e.target.value
    if (!selectedDate) {
      setFrom('')
      return
    }
    
    const selected = new Date(selectedDate)
    selected.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selected < today) {
      dispatch({ type: 'ui/showToast', payload: { message: 'Start date cannot be before today', severity: 'warning' } })
      return
    }
    
    setFrom(selectedDate)
  }

  // Handle to date change with validation
  const handleToDateChange = (e) => {
    const selectedDate = e.target.value
    if (!selectedDate) {
      setTo('')
      return
    }
    
    const selected = new Date(selectedDate)
    selected.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selected < today) {
      dispatch({ type: 'ui/showToast', payload: { message: 'End date cannot be before today', severity: 'warning' } })
      return
    }
    
    setTo(selectedDate)
  }

  // Auto-calculate inclusive days when dates change
  useEffect(() => {
    if (!from || !to) return
    const fromDate = new Date(from)
    const toDate = new Date(to)
    if (isNaN(fromDate) || isNaN(toDate)) return
    const diffMs = toDate - fromDate
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
    setDays(diffDays > 0 ? diffDays : 0)
  }, [from, to])

  // UPDATED: Now selecting 'applying' specifically for the button
  const applying = useSelector(s => s.leaves.applying)
  const error = useSelector(s => s.leaves.error)

  const submit = (e) => {
    e.preventDefault()
    console.log('LeaveForm: submit clicked', { user, type, from, to, days })
    
    if (!user) return dispatch({ type: 'ui/showToast', payload: { message: 'Please sign in to apply for leave', severity: 'warning' } })
    if (!from || !to) return dispatch({ type: 'ui/showToast', payload: { message: 'Select valid dates', severity: 'warning' } })
    if (days <= 0) return dispatch({ type: 'ui/showToast', payload: { message: 'Days must be > 0', severity: 'warning' } })
    
    // Validate dates are not before current date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const fromDate = new Date(from)
    fromDate.setHours(0, 0, 0, 0)
    const toDate = new Date(to)
    toDate.setHours(0, 0, 0, 0)
    
    if (fromDate < today) return dispatch({ type: 'ui/showToast', payload: { message: 'Start date cannot be before today', severity: 'warning' } })
    if (toDate < today) return dispatch({ type: 'ui/showToast', payload: { message: 'End date cannot be before today', severity: 'warning' } })
    if (toDate < fromDate) return dispatch({ type: 'ui/showToast', payload: { message: 'End date must be after start date', severity: 'warning' } })
    
    dispatch(applyLeaveRequest({ userId: user.id, type, from, to, days }))
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Apply Leave</Typography>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField select fullWidth label="Type" value={type} onChange={e => setType(e.target.value)}>
          {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        
        <TextField fullWidth label="From" type="date" InputLabelProps={{ shrink: true }} value={from} onChange={handleFromDateChange} inputProps={{ min: minDate }} />
        <TextField fullWidth label="To" type="date" InputLabelProps={{ shrink: true }} value={to} onChange={handleToDateChange} inputProps={{ min: minDate }} />
        
        <TextField fullWidth label="Days" type="number" value={days} InputProps={{ readOnly: true }} helperText="Auto-calculated from date range" />
        
        {/* Button uses 'applying' state now */}
        <Button type="submit" variant="contained" disabled={applying} sx={{ py: { xs: 1, sm: 1.5 } }}>
            {applying ? 'Applying...' : 'Apply'}
        </Button>
        
        {error && !applying && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>{error}</Typography>
        )}
      </form>
    </Paper>
  )
}