import { useState, useEffect } from 'react';

// Hardcoded Discord configuration
const DISCORD_GUILD_ID = "1426212910497267879"; // Örnek sunucu ID - buraya gerçek sunucu ID'nizi girin
const DISCORD_BOT_TOKEN = "MTUwMzg1ODM3ODU0MjQxNTk0Mg.GKPLcz.0H6lqFnT7QZBn1wcFLO_McmdDyCSwCjwYJG_GM"; // Örnek bot token - buraya gerçek bot token'ınızı girin

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
