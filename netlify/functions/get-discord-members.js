export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { guildId, botToken } = JSON.parse(event.body);

    if (!guildId || !botToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'guildId and botToken are required' })
      };
    }

    // Discord API endpoint for getting guild members
    const response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/members?limit=1000`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Discord API Error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Discord API error: ${response.status}`,
          details: errorData 
        })
      };
    }

    const data = await response.json();
    
    // Transform member data for easier use
    const formattedMembers = data.map(member => ({
      id: member.user.id,
      username: member.user.username,
      displayName: member.user.global_name || member.user.username,
      avatar: member.user.avatar ? 
        `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : 
        `https://cdn.discordapp.com/embed/avatars/0.png`,
      roles: member.roles
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ members: formattedMembers })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
