import express from 'express';
import cors from 'cors';

const app = express();

// 🔹 Sirf ngrok URL allow kar rahe hain temporarily
app.use(cors({ origin: '*' }));

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

// Saari existing APIs yahan hain
// e.g. app.use('/api/consultations', consultationsRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
