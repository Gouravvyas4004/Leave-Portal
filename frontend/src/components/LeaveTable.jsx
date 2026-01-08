import React from 'react'
import { useSelector } from 'react-redux'
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Typography, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const getStatusChip = (status) => {
  const s = status.toLowerCase();
  if (s === 'approved') return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" variant="outlined" />;
  if (s === 'rejected') return <Chip icon={<CancelIcon />} label="Rejected" color="error" size="small" variant="outlined" />;
  return <Chip icon={<AccessTimeIcon />} label="Pending" color="warning" size="small" variant="outlined" />;
}

export default function LeaveTable({ onApprove, onReject, adminView, items: itemsProp }) {
  const storeItems = useSelector(s => s.leaves.items)
  const items = itemsProp || storeItems

  if (!items || items.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography>No leave requests found.</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ width: '100%', overflow: { xs: 'auto', sm: 'hidden' }, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
      <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            {adminView && <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>}
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(row => (
            <TableRow key={row._id || row.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>{row.type}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(row.from).toLocaleDateString()} — {new Date(row.to).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>{row.days}</TableCell>
              <TableCell>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                  {getStatusChip(row.status)}
                  {row.approverReason && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, maxWidth: 150 }} noWrap>
                      Note: {row.approverReason}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              {adminView && <TableCell>{row.userId?.name || 'Unknown'}</TableCell>}
              <TableCell align="right">
                {adminView ? (
                  row.status === 'pending' ? (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" color="success" onClick={() => onApprove && onApprove(row)}>Accept</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => onReject && onReject(row)}>Reject</Button>
                    </Box>
                  ) : row.status === 'rejected' ? (
                    <Button size="small" variant="contained" color="success" onClick={() => onApprove && onApprove(row)}>Approve</Button>
                  ) : (
                    <Typography variant="caption" color="text.disabled">Processed</Typography>
                  )
                ) : (
                  <Typography variant="caption" color="text.disabled">Processed</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}