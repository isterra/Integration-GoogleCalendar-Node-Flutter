const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')

module.exports = {
    async delete(req, res) {
        const { eventId } = req.body;
        if (!eventId) return res.status(400).json({ error: "EventId not found" })
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
            calendar.events.delete({
                auth: jwtClient,
                calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                eventId: eventId,
            }, (err, event) => {
                if (err) {
                    return res.status(404).json({
                        "message": "Falied to delete event",
                        "error": err.message
                    })
                } else {
                    return res.status(200).json({ "message": "Sucess" })
                }
            })
        } catch (err) {
            return res.status(400).json({
                "message": "Falied to delete event",
                "error": err.message
            })
        }
    }
}