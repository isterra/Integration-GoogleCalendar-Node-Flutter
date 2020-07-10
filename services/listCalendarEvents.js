const { google } = require('googleapis');
const googleConfig = require('../config/googleConfig')
// 30 events last
module.exports = {
    async read(req, res) {
        const now = new Date().toLocaleString('pt-BR');
        const [date] = now.split(' ');
        const [year, month, day] = date.split('-')
        var next30days;
        var last30days;
        if (month - 1 == 0) last30days = `${year - 1}-${month + 11}-${dia}T00:00:00-03:00`
        else last30days = `${year}-${month - 1}-${day}T00:00:00-03:00`
        if (month + 1 > 12) next30days = `${year + 1}-${month - 11}-${day}T00:00:00-03:00`
        else next30days = `${year}-${month + 1}-${day}T00:00:00-03:00`
        const maxTime = `${year}-${month}-${day}T00:00:00-03:00`
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
            calendar.events.list({
                calendarId: googleConfig.GOOGLE_CALENDAR_ID,
                auth: jwtClient,
                orderBy: 'updated',
                singleEvents: true,
                timeMin: last30days,
                timeMax: maxTime
            }, async function (err, event) {
                if (err)
                    return res.status(400).json(err.message)
                return res.status(200).json(event.data)
            })
        } catch (err) {
            return res.status(400).json({ "error": err.message })
        }
    }
}