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
        const { summary, description, date, startTime } = req.body;
        if (!summary) return res.status(400).json({ "error": "Summary not found" })
        if (!description) return res.status(400).json({ "error": "Description not found" })
        if (!date) return res.status(400).json({ "error": "Date not found" })
        if (!startTime) return res.status(400).json({ "error": "StartTime not found" })
        var format = /(\d{2})[-.\/](\d{2})[-.\/](\d{4})/.exec(date);
        if (format == null) {
            return res.status(400).json({ "error": "Invalid date format" })
        }

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
        destructuringDate = date.split('/');
        now = new Date();
        day = now.getUTCDate();
        month = now.getMonth() + 1;
        if (month > destructuringDate[1]) {
            return res.status(400).json({ error: "Invalid month" })
        }
        else if (month == destructuringDate[1] && day > destructuringDate[0]) {
            return res.status(400).json({ error: "Invalid day" })
        }
        var start = `${destructuringDate[2]}-${destructuringDate[1]}-${destructuringDate[0]}T${startTime}:00:00-03:00`
        var endTime = `${destructuringDate[2]}-${destructuringDate[1]}-${destructuringDate[0]}T${parseInt(startTime) + parseInt(1)}:00:00-03:00`
        calendar.events.list({
            calendarId: googleConfig.GOOGLE_CALENDAR_ID,
            auth: jwtClient,
            orderBy: 'startTime',
            singleEvents: true,
            timeMin: start,
            timeMax: endTime,
        }, async function (err, event) {
            if (err)
                res.status(400).json({ error: err.message })
            else {
                if (event.data.items.length > 0)
                    res.status(400).send({
                        error: "Event unavailable",
                        message: "This hour is already busy"
                    })
                else {
                    calendar.events.insert({
                        auth: jwtClient,
                        calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                        requestBody: {
                            status: "confirmed",
                            summary: summary,
                            description: description,
                            start:
                            {
                                dateTime: start,
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