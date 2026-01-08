import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'

export default function KpiCard({ title, value, subtext, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.06)' }} aria-label={`${title} card`}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon && <Box sx={{ fontSize: 36, color: `${color}.main`, opacity: 0.95 }}>{icon}</Box>}
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">{title}</Typography>
          <Typography variant="h5" fontWeight="700" color="text.primary">{value}</Typography>
          {subtext && <Typography variant="caption" color="text.secondary">{subtext}</Typography>}
        </Box>
      </CardContent>
    </Card>
  )
}
