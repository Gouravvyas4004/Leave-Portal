import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginRequest, registerRequest } from '../store/userSlice'
import { TextField, Button, Paper, Typography, MenuItem, Box, Grid, Link, InputAdornment, IconButton } from '@mui/material'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const dispatch = useDispatch()
  const loading = useSelector(s => s.user.loading)
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    if (isRegister) {
      if (!formData.name) return dispatch({ type: 'ui/showToast', payload: { message: 'Name is required', severity: 'warning' } })
      if (!formData.password) return dispatch({ type: 'ui/showToast', payload: { message: 'Password is required', severity: 'warning' } })
      if (formData.password !== formData.confirmPassword) return dispatch({ type: 'ui/showToast', payload: { message: 'Passwords do not match', severity: 'error' } })
      dispatch(registerRequest(formData))
    } else {
      dispatch(loginRequest({ email: formData.email, password: formData.password }))
    }
  }

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Branding Side */}
      <Grid item xs={false} sm={4} md={7}
        sx={{
          backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          p: 4
        }}
      >
        <Box sx={{ textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
          <BusinessCenterIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>HR Portal</Typography>
          <Typography variant="h6" sx={{ opacity: 0.8 }}>Internal Leave Management System</Typography>
        </Box>
      </Grid>

      {/* Form Side */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
          <Typography component="h1" variant="h4" fontWeight="bold" color="primary" gutterBottom>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {isRegister ? 'Enter your details to get started.' : 'Please sign in to continue.'}
          </Typography>

          <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
            {isRegister && (
              <TextField margin="normal" fullWidth label="Full Name" name="name" autoFocus value={formData.name} onChange={handleChange} />
            )}
            <TextField margin="normal" fullWidth label="Email Address" name="email" autoComplete="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)} onMouseDown={(e) => e.preventDefault()} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {isRegister && (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)} onMouseDown={(e) => e.preventDefault()} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <TextField select margin="normal" fullWidth label="Role" name="role" value={formData.role} onChange={handleChange}>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </TextField>
              </>
            )}

            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }} disabled={loading}>
              {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component="button" variant="body2" type="button" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}>
                  {isRegister ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </Link>
              </Grid>
            </Grid>
            
            
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}