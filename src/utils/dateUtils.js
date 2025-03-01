export const formatDistanceToNow = (date, options = {}) => {
    const now = new Date();
    const distanceInSeconds = Math.floor((now - new Date(date)) / 1000);

    const thresholds = [
        { limit: 60, label: 'second' },
        { limit: 3600, label: 'minute' },
        { limit: 86400, label: 'hour' },
        { limit: 604800, label: 'day' },
        { limit: 2419200, label: 'week' },
        { limit: 29030400, label: 'month' },
        { limit: Infinity, label: 'year' },
    ];

    let distance;
    let label;

    for (const threshold of thresholds) {
        if (distanceInSeconds < threshold.limit) {
            distance = Math.floor(distanceInSeconds / (threshold.limit / (threshold.label === 'second' ? 1 : 60)));
            label = threshold.label;
            break;
        }
    }

    const suffix = options.addSuffix ? ' ago' : '';
    return `${distance} ${label}${distance !== 1 ? 's' : ''}${suffix}`;
};