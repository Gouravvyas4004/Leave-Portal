import React from 'react'
import { Card, CardContent, Typography, Divider, List, ListItem, ListItemText } from '@mui/material'

export default function UserDetails({ user, leaves }){
  if (!user) return <Card className="p-4"><CardContent><Typography>No user selected</Typography></CardContent></Card>
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{user.name}</Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>{user.email} • {user.role}</Typography>
        <Typography variant="body2">Leave balance: <strong>{user.leaveBalance}</strong></Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Leave history</Typography>
        <List dense>
          {leaves.length === 0 && <ListItem><ListItemText primary="No leaves" /></ListItem>}
          {leaves.map(l=> (
            <ListItem key={l._id} divider>
              <ListItemText primary={`${l.type} • ${new Date(l.from).toLocaleDateString()} → ${new Date(l.to).toLocaleDateString()} (${l.days}d)`} secondary={`${l.status}${l.approverReason ? ' — Reason: ' + l.approverReason : ''}`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}