import React from 'react'
import { Grid, Card, CardContent, Typography, Box, Button, CardActions, Chip } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

export default function ApprovalGrid({ items = [], status = 'pending', onApprove, onReject }) {
  const filtered = status === 'all' ? items : items.filter(i => i.status === status)

  const statusLabel = status === 'all' ? 'requests' : (status === 'pending' ? 'pending approvals' : (status === 'approved' ? 'approved requests' : 'rejected requests'))

  if (!filtered || filtered.length === 0) {
    return (
      <Card sx={{ p: 3, border: '1px dashed #e2e8f0', textAlign: 'center', color: 'text.secondary' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600}>No {statusLabel}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>There are currently no {statusLabel} to show.</Typography>
        </CardContent>
      </Card>
    )
  }

  const getChip = (s) => {
    if (s === 'approved') return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />
    if (s === 'rejected') return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" />
    return <Chip icon={<AccessTimeIcon />} label="Pending" color="warning" size="small" />
  }

  return (
    <Grid container spacing={2}>
      {filtered.map(row => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={row._id || row.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{row.type}</Typography>
                {getChip(row.status)}
              </Box>

              <Typography variant="body2" color="text.secondary">{new Date(row.from).toLocaleDateString()} — {new Date(row.to).toLocaleDateString()}</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>{row.days} day{row.days > 1 ? 's' : ''}</Typography>

              {row.userId && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Employee: {row.userId.name || row.userId}
                </Typography>
              )}

              {row.approverReason && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Note: {row.approverReason}
                </Typography>
              )}
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {/* For pending: show both actions; for rejected: allow approve; for approved: actions hidden */}
              {row.status === 'pending' && (
                <>
                  <Button size="small" color="error" variant="outlined" onClick={() => onReject && onReject(row)}>Reject</Button>
                  <Button size="small" color="success" variant="contained" onClick={() => onApprove && onApprove(row)}>Approve</Button>
                </>
              )}

              {row.status === 'rejected' && (
                <Button size="small" color="success" variant="contained" onClick={() => onApprove && onApprove(row)}>Approve</Button>
              )}

              {row.status === 'approved' && (
                <Button size="small" color="inherit" variant="outlined" disabled>Approved</Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
