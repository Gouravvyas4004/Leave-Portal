import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box, Container, Menu, MenuItem, Tooltip, Divider, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/userSlice'

export default function Layout({ children }){
  const user = useSelector(s => s.user.user)
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)
  const handleLogoutClick = () => { handleCloseMenu(); setConfirmOpen(true) }
  const handleConfirmLogout = () => { setConfirmOpen(false); dispatch(logout()) }
  const handleCancelLogout = () => setConfirmOpen(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <AppBar position="fixed" sx={{ zIndex: (t)=>t.zIndex.drawer + 1, background: 'linear-gradient(90deg,#0ea5e9,#6366f1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Leave Portal</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right', mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{user?.name ?? 'Guest'}</Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.85)' }}>{user?.role ?? ''}</Typography>
            </Box>

            <Tooltip title="Account settings">
              <IconButton onClick={handleOpenMenu} size="small" sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.08)' }} aria-controls={open ? 'account-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
                <Avatar sx={{ width: 36, height: 36 }}>{user?.name?.[0] ?? 'U'}</Avatar>
              </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu} onClick={handleCloseMenu} PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 180 } }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" fontWeight={700}>{user?.name ?? 'Guest'}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email ?? ''}</Typography>
              </Box>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogoutClick}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>

            <Dialog open={confirmOpen} onClose={handleCancelLogout}>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to logout?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelLogout} color="inherit">Cancel</Button>
                <Button onClick={handleConfirmLogout} color="primary" variant="contained">Logout</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer to offset fixed AppBar */}
      <Toolbar />

      <Container component="main" sx={{ flexGrow: 1, py: 4, maxWidth: 'xl' }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', mt: 'auto', color: 'text.secondary' }}>
        © {new Date().getFullYear()} Leave Portal
      </Box>
    </Box>
  )
}
