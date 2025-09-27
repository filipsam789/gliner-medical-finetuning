import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useKeycloakAuth } from '@/contexts/useKeycloakContext';
import { subscribeUser, getPremiumContent, getRegularContent } from '@/api/apiCalls';

interface ContentData {
  message: string;
  content: string;
  user: string;
  features: string[];
}

const RoleTestPage: React.FC = () => {
  const { token } = useKeycloakAuth();
  const [premiumContent, setPremiumContent] = useState<ContentData | null>(null);
  const [regularContent, setRegularContent] = useState<ContentData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<string>('');

  const handleAssignPremiumRole = async () => {
    if (!token) return;
    setLoading('premium-assign');
    setError('');
    
    try {
      await subscribeUser(token);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign premium role');
      setLoading('');
    }
  };

  const handleGetPremiumContent = async () => {
    if (!token) return;
    setLoading('premium-content');
    setError('');
    setPremiumContent(null);
    
    try {
      const content = await getPremiumContent(token);
      setPremiumContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get premium content');
    } finally {
      setLoading('');
    }
  };

  const handleGetRegularContent = async () => {
    if (!token) return;
    setLoading('regular-content');
    setError('');
    setRegularContent(null);
    
    try {
      const content = await getRegularContent(token);
      setRegularContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get regular content');
    } finally {
      setLoading('');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Role-Based Access Control Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Test the role-based access control system by assigning roles and accessing protected content.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Step 1: Assign Premium Role
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Click the button below to assign yourself a premium_user role. This will remove any existing roles.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAssignPremiumRole}
              disabled={loading === 'premium-assign'}
            >
              {loading === 'premium-assign' ? 'Assigning...' : 'Assign Premium Role'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Step 2: Try Accessing Protected Content
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleGetRegularContent}
                disabled={loading === 'regular-content'}
              >
                {loading === 'regular-content' ? 'Loading...' : 'Get Regular Content'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleGetPremiumContent}
                disabled={loading === 'premium-content'}
              >
                {loading === 'premium-content' ? 'Loading...' : 'Get Premium Content'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {regularContent && (
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Chip label="Regular User Content" color="primary" size="small" />
                <Typography variant="h6">{regularContent.message}</Typography>
              </Stack>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {regularContent.content}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Available Features:
              </Typography>
              <List dense>
                {regularContent.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText primary={`• ${feature}`} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="caption" color="text.secondary">
                User: {regularContent.user}
              </Typography>
            </CardContent>
          </Card>
        )}

        {premiumContent && (
          <Card sx={{ bgcolor: 'gold', color: 'black' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Chip label="Premium User Content" color="warning" size="small" />
                <Typography variant="h6">{premiumContent.message}</Typography>
              </Stack>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {premiumContent.content}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Premium Features:
              </Typography>
              <List dense>
                {premiumContent.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText primary={`• ${feature}`} />
                  </ListItem>
                ))}
              </List>
              <Typography variant="caption" color="text.secondary">
                User: {premiumContent.user}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default RoleTestPage;