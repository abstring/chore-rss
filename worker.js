export default {
    async fetch(request) {
      const timezone = "America/New_York"; // Specify the desired timezone
      const version = "1.6.3"; // Update the version for clarity
  
      const sons = ["Neal", "Noah", "Nate"];
      const chores = ["Kitchen and Trash", "Dogs", "Dogs"]; // Nate starts on "Kitchen and Trash"
  
      // Helper function to convert a Date object to the specified timezone
      function convertToTimezone(date, timezone) {
        const timeZoneFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: false,
        });
        const parts = timeZoneFormatter.formatToParts(date);
        const year = parseInt(parts.find(part => part.type === "year").value);
        const month = parseInt(parts.find(part => part.type === "month").value) - 1; // Month is zero-based
        const day = parseInt(parts.find(part => part.type === "day").value);
        const hour = parseInt(parts.find(part => part.type === "hour").value);
        const minute = parseInt(parts.find(part => part.type === "minute").value);
        const second = parseInt(parts.find(part => part.type === "second").value);
  
        return new Date(year, month, day, hour, minute, second);
      }
  
      // Get current date in the specified timezone
      const currentDate = convertToTimezone(new Date(), timezone);
  
      // Calculate the start of the year in the specified timezone
      const startOfYear = convertToTimezone(new Date(currentDate.getFullYear(), 0, 1), timezone);
  
      // Calculate days since start of the year and the current week
      const daysSinceStart = Math.floor((currentDate - startOfYear) / (24 * 60 * 60 * 1000));
      const currentWeek = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  
      // Set the initial chore rotation offset to ensure Nate starts on "Kitchen and Trash"
      const initialRotationOffset = 2; // Nate should be first, Neal next, Noah last
      const rotatedChores = chores.map(
        (_, index) => chores[(index + currentWeek - 1 + initialRotationOffset) % chores.length]
      );
      const assignments = sons.map((son, index) => `${son}: ${rotatedChores[index]}`).join(" ~~ ");
  
      // Format the current date in the specified timezone
      const timeZoneFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const formattedDate = timeZoneFormatter.format(currentDate);
  
      // Build the RSS feed
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
            <p>v${version} Week ${currentWeek}, current as of ${formattedDate} (${timezone.replace("_", " ")}). ${daysUntilNextFriday} more days until chores switch.</p>
          ]]>
        </description>
        <pubDate>${formattedDate}</pubDate>
        <guid>${currentDate.getTime()}</guid>
      </item>
    </channel>
  </rss>`.trim();
  
      // Return the response as RSS
      return new Response(rssFeed, {
        headers: {
          "Content-Type": "application/rss+xml",
        },
      });
    },
  };