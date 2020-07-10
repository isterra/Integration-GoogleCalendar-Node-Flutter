const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')
// req body row json{
//     {
//         "summary":"Evento Teste",
//         "location":"local",
//         "description":"Teste pra adicionar evento",
//         "startTime":"2020-07-12T13:00:00-03:00",
//         "endTime":"2020-07-12T14:00:00-03:00"
//     }
// }

module.exports = {
    async create(req, res) {
        const info = req.body;
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

        calendar.events.list({
            calendarId: googleConfig.GOOGLE_CALENDAR_ID,
            auth: jwtClient,
            orderBy: 'startTime',
            singleEvents: true,
            timeMin: info.startTime,
            timeMax: info.endTime,
        }, async function (err, event) {
            if (err)
                res.staus(400).json(err)
            else {
                if (event.data.items.length > 0)
                    res.status(400).send({ error: "event unavailable" })
                else {
                    calendar.events.insert({
                        auth: jwtClient,
                        calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                        requestBody: {
                            status: "confirmed",
                            summary: info.summary,
                            description: info.description,
                            start:
                            {
                                dateTime: info.startTime,
                            },
                            end: {
                                dateTime: info.endTime,
                            },
                        }

                    }, function (err, event) {
                        if (err) {
                            return res.status(400).json({ message: "Error", error: err.message })
                        }
                        return res.status(200).json({
                            "eventId": event.data.id,
                            "data": event.data
                        })
                    })
                }
            }
        })
    }
}