import React from 'react'
import { Card, CardContent, Typography, Divider, List, ListItem, ListItemText } from '@mui/material'

export default function UserDetails({ user, leaves }){
  if (!user) return <Card sx={{ p: { xs: 2, sm: 3 } }}><CardContent><Typography>No user selected</Typography></CardContent></Card>
  return (
    <Card sx={{ p: { xs: 1, sm: 2 } }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{user.name}</Typography>
        <Typography color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{user.email} • {user.role}</Typography>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Leave balance: <strong>{user.leaveBalance}</strong></Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>Leave history</Typography>
        <List dense>
          {leaves.length === 0 && <ListItem><ListItemText primary="No leaves" /></ListItem>}
          {leaves.map(l=> (
            <ListItem key={l._id} divider>
              <ListItemText 
                primary={`${l.type} • ${new Date(l.from).toLocaleDateString()} → ${new Date(l.to).toLocaleDateString()} (${l.days}d)`} 
                secondary={`${l.status}${l.approverReason ? ' — Reason: ' + l.approverReason : ''}`}
                primaryTypographyProps={{ sx: { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                secondaryTypographyProps={{ sx: { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}