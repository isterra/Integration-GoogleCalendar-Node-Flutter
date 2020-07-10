const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')

module.exports = {
    async update(req, res) {
        const data = req.body;
        if (!data.eventId)
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
                    eventId: data.eventId,
                },
                function (error, event) {
                    if (error)
                        res.status(404).json({ "error": "Event Not Found" })
                    else {
                        try {
                            calendar.events.update({
                                auth: jwtClient,
                                calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                                eventId: data.eventId,
                                requestBody: {
                                    start: {
                                        dateTime: data.startTime ? data.startTime : event.data.start.dateTime
                                    },
                                    end: {
                                        dateTime: data.endTime ? data.endTime : event.data.end.dateTime
                                    },
                                    status: "confirmed",
                                    summary: data.summary ? data.summary : event.data.summary,
                                    description: data.description ? data.description : event.data.description,
                                }
                            }, (err, event) => {
                                if (err)
                                    return res.status(400).json(
                                        {
                                            "message": "Falied to update Event",
                                            "error": err.message
                                        }
                                    )
                                else
                                    return res.status(200).json(
                                        {
                                            "eventId": event.data.id,
                                            "data": event.data
                                        }
                                    )
                            })
                        } catch (err) {
                            throw err
                        }
                    }
                }
            )
        } catch (err) {
            return res.status(400).json({ "error": err.message })
        }
    }

}