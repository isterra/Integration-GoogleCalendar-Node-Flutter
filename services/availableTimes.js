const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')
// req:
// {
// 	"data":"10/07/2020"
// }

module.exports = {
    async read(req, res) {
        const { date } = req.body;
        if (!date)
            return res.status(400).json({ "error": "Date not found" })
        var format = /(\d{2})[-.\/](\d{2})[-.\/](\d{4})/.exec(date);
        if (format == null) {
            return res.status(400).json({ "error": "Invalid date format" })
        }
        var horarios = {
            '12': "available",
            '13': "available",
            '14': "available",
            '15': "available",
            '16': "available",
            '17': "available",
        }
        const [dia, mes, ano] = date.split('/')
        const jwtClient = new google.auth.JWT(
            googleConfig.GOOGLE_CLIENT_EMAIL,
            null,
            googleConfig.GOOGLE_PRIVATE_KEY,
            googleConfig.SCOPES
        );
        var event = {
            summary: 'teste',
            location: 'na cadeia',
            description: 'vaaiiii',
            start: {
                dateTime: '2020-07-10',
                timeZone: 'America/Los_Angeles',
            },
            end: {
                dateTime: '2020-07-11',
                timeZone: 'America/Los_Angeles',
            },
        };

        const calendar = await google.calendar({
            version: 'v3',
            project: googleConfig.GOOGLE_PROJECT_NUMBER,
            auth: jwtClient
        });
        try {
            calendar.events.list({
                calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                auth: jwtClient,
                orderBy: 'startTime',
                singleEvents: true,
                timeMin: `${ano}-${mes}-${dia}T00:00:00-03:00`,
                timeMax: `${ano}-${mes}-${dia}T23:00:00-03:00`
            }, async function (err, event) {
                if (err)
                    res.staus(400).json(err.message)
                else {
                    var data = event.data.items;
                    data.forEach((value) => {
                        var completeData = value.start.dateTime.split('T');
                        horario = completeData[1];
                        destructuring = horario.split(':')
                        var [hora] = destructuring;
                        horarios[hora] = "unavailable"
                    });
                    res.status(200).json(horarios)
                }

            })
        } catch (err) {
            res.status(400).json({ "error": err.message })
        }
    }
}