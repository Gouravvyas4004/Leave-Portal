import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Snackbar, Alert } from '@mui/material'
import { clearToast } from '../store/uiSlice'

export default function Toast(){
  const dispatch = useDispatch()
  const toast = useSelector(s => s.ui.toast)

  const handleClose = () => dispatch(clearToast())

  return (
    <Snackbar open={!!toast} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      {toast ? (
        <Alert onClose={handleClose} severity={toast.severity || 'info'} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      ) : null}
    </Snackbar>
  )
}
