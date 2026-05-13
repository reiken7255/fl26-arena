import { useState, useEffect } from 'react';

// Environment variables (set in .env or Netlify dashboard)
const DISCORD_GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID || "";
const DISCORD_BOT_TOKEN = import.meta.env.VITE_DISCORD_BOT_TOKEN || "";

export const useDiscordMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useDiscordMembers: effect running');
    const fetchGuildMembers = async () => {
      console.log('useDiscordMembers: fetching...');
      setLoading(true);
      setError(null);
      
      try {
        // Call our Netlify Function with hardcoded values
        const response = await fetch('/.netlify/functions/get-discord-members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ guildId: DISCORD_GUILD_ID, botToken: DISCORD_BOT_TOKEN })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Discord members loaded:', data.members?.length || 0);
        setMembers(data.members || []);
      } catch (err) {
        console.error('Discord API Error:', err);
        console.log('Fallback to mock data');
        setError(err.message);
        // Fallback: Mock data for testing
        setMembers([
          { id: '1', username: 'player1', displayName: 'Player One', avatar: '', roles: [] },
          { id: '2', username: 'player2', displayName: 'Player Two', avatar: '', roles: [] },
          { id: '3', username: 'player3', displayName: 'Player Three', avatar: '', roles: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildMembers();
  }, []);

  return { members, loading, error };
};
