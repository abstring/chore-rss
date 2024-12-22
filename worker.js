import moment from 'moment-timezone';

export default {
    async fetch(request) {
      const sons = [`Nate`, `Noah`, `Neal`];
      const chores = [`Kitchen and Trash`, `Dogs`, `Dogs`];
  
      // Get the current date and time in Eastern Time
      const currentDate = moment().tz("America/New_York");
      const startOfYear = moment().tz("America/New_York").startOf('year');
      const daysSinceStart = currentDate.diff(startOfYear, 'days');
      const currentWeek = Math.ceil((daysSinceStart + startOfYear.day() + 1) / 7);
  
      // Determine the next Friday (when chores switch)
      const daysUntilNextFriday = (5 - currentDate.day() + 7) % 7 || 7; // Days until Friday
      const nextFriday = currentDate.clone().add(daysUntilNextFriday, 'days');
  
      // Rotate chores based on the current week
      const rotatedChores = chores.map((_, index) => chores[(index + currentWeek - 1) % chores.length]);
      const assignments = sons.map((son, index) => `${son}: ${rotatedChores[index]}`).join(` ~|~ `);
  
      // Format date in m/d/y hh:mm (Eastern Time)
      const formattedDate = currentDate.format('M/D/YYYY HH:mm');
  
      const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Chore Assignments</title>
      <link>https://chore-rss.abstring.workers.dev</link>
      <description>Dynamic updates on weekly chore assignments</description>
      <lastBuildDate>${formattedDate}</lastBuildDate>
      <language>en-us</language>
      <item>
        <title>${assignments}</title>
        <link>https://chore-rss.abstring.workers.dev/chore-update</link>
        <description>
          <![CDATA[
            <p>v1.5 Week ${currentWeek}, current as of ${formattedDate} (Eastern Time). ${daysUntilNextFriday} more days until chores switch.</p>
          ]]>
        </description>
        <pubDate>${formattedDate}</pubDate>
        <guid>${currentDate.valueOf()}</guid>
      </item>
    </channel>
  </rss>`.trim();
  
      return new Response(rssFeed, {
        headers: {
          'Content-Type': 'application/rss+xml',
        },
      });
    },
  };