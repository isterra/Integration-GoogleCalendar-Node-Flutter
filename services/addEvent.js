const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')
// req body row json{
//     {
//         "summary":"Evento Teste",
//         "description":"Teste pra adicionar evento",
//         "date":"27/02/2000",
//         "startTime":"14"
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
        var date = info.date;
        date = date.split('/');
        var startTime = `${date[2]}-${date[1]}-${date[0]}T${info.startTime}:00:00-03:00`
        var endTime = `${date[2]}-${date[1]}-${date[0]}T${parseInt(info.startTime) + parseInt(1)}:00:00-03:00`
        calendar.events.list({
            calendarId: googleConfig.GOOGLE_CALENDAR_ID,
            auth: jwtClient,
            orderBy: 'startTime',
            singleEvents: true,
            timeMin: startTime,
            timeMax: endTime,
        }, async function (err, event) {
            if (err)
                res.status(400).json({ error: err.message })
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
                                dateTime: startTime,
                            },
                            end: {
                                dateTime: endTime,
                            },
                        }

                    }, function (err, event) {
                        if (err) {
                            res.status(400).json({ message: "Error", error: err.message })
                        }
                        else
                            res.status(200).json({
                                "eventId": event.data.id,
                                "data": event.data
                            })
                    })
                }
            }
        })
    }
}