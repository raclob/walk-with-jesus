import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder",
});

interface Supplement {
  ref: { bookId: string; chapter: number; verseStart?: number; verseEnd?: number };
  note?: string;
}

interface Point {
  point: string;
  answer: string;
  supplements?: Supplement[];
}

interface SummarizeBody {
  title: string;
  speaker?: string;
  date: string;
  passage?: { bookId: string; chapter: number; verseStart?: number; verseEnd?: number };
  points: Point[];
  supplemental: Supplement[];
  notes?: string;
}

function refLabel(r: Supplement["ref"]): string {
  const book = r.bookId.replace(/(\d)([a-z])/gi, "$1 $2").replace(/^[a-z]/, c => c.toUpperCase());
  let s = `${book} ${r.chapter}`;
  if (r.verseStart) {
    s += `:${r.verseStart}`;
    if (r.verseEnd && r.verseEnd !== r.verseStart) s += `-${r.verseEnd}`;
  }
  return s;
}

router.post("/sermon/summarize", async (req, res) => {
  try {
    const body = req.body as SummarizeBody;

    const lines: string[] = [];
    lines.push(`Sermon title: ${body.title || "(untitled)"}`);
    if (body.speaker) lines.push(`Speaker: ${body.speaker}`);
    if (body.date) lines.push(`Date: ${body.date}`);
    if (body.passage) lines.push(`Primary passage: ${refLabel(body.passage)}`);
    lines.push("");

    if (body.points.length > 0) {
      lines.push("Main points:");
      body.points.forEach((p, i) => {
        if (p.point) lines.push(`  ${i + 1}. ${p.point}`);
        if (p.answer) lines.push(`     Reflection: ${p.answer}`);
        if (p.supplements && p.supplements.length > 0) {
          const refs = p.supplements.map(s => {
            let r = refLabel(s.ref);
            if (s.note) r += ` (${s.note})`;
            return r;
          }).join(", ");
          lines.push(`     Supporting verses: ${refs}`);
        }
      });
      lines.push("");
    }

    if (body.supplemental.length > 0) {
      const refs = body.supplemental.map(s => {
        let r = refLabel(s.ref);
        if (s.note) r += ` — ${s.note}`;
        return r;
      }).join("; ");
      lines.push(`Supplemental cross-references: ${refs}`);
      lines.push("");
    }

    if (body.notes) {
      lines.push(`Additional notes: ${body.notes}`);
    }

    const sermonText = lines.join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You are a thoughtful assistant helping Christians reflect on sermons they have heard. " +
            "Given sermon notes, write a concise, spiritually warm summary (3-5 short paragraphs). " +
            "Capture the core message, how the main points connect, and one or two personal takeaways. " +
            "Write in plain prose — no bullet points, no headers. Tone: reverent, clear, encouraging.",
        },
        {
          role: "user",
          content: `Here are my sermon notes:\n\n${sermonText}\n\nPlease summarize this sermon for me.`,
        },
      ],
    });

    const summary = completion.choices[0]?.message?.content ?? "";
    res.json({ summary });
  } catch (err) {
    console.error("Sermon summarize error:", err);
    res.status(500).json({ error: "Failed to generate summary. Please try again." });
  }
});

export default router;
