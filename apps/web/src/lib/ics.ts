export function generateICS(event: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
}) {
    const formatDate = (date: string) => {
        return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CEMS//Campus Event Management System//EN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@cems.aastu.edu.et`,
        `DTSTAMP:${formatDate(new Date().toISOString())}`,
        `DTSTART:${formatDate(event.startTime)}`,
        `DTEND:${formatDate(event.endTime)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || 'AASTU Campus'}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
