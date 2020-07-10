const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')

module.exports = {
    async get(req, res) {
        const { eventId } = req.body;
        if (!eventId)
            return res.status(400).json({ "error": "eventId not found" })
        const jwtClient = new google.auth.JWT(
            googleConfig.GOOGLE_CLIENT_EMAIL,
            null,
            googleConfig.GOOGLE_PRIVATE_KEY,
            googleConfig.SCOPES
        );
        const calendar = await google.calendar({
            version: 'v3',
            project: googleConfig.GOOGLE_PROJECT_NUMBER,
            auth: jwtClient
        });
        try {
            calendar.events.get(
                {
                    auth: jwtClient,
                    calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                    eventId: eventId,
                },
                function (error, event) {
                    if (error)
                        return res.status(404).json({ "error": "Event Not Found" })
                    else return res.status(200).json(event.data)
                }
            )
        } catch (err) {
            return res.status(400).json({ "error": "Falied to find event.Try again!" })
        }

    }
}