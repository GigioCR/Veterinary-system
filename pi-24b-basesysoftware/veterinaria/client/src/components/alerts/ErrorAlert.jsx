import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
function ErrorAlert({message, open, onClose}) {
    const messageToDisplay = message;

    return (
        <div>
            <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
              <Alert
                onClose={onClose}
                severity="error"
                sx={{ width: '100%' }}
              >
                {messageToDisplay}
              </Alert>
            </Snackbar>
        </div>
    )
}
export default ErrorAlert