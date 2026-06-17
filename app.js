let leadMode = false;
let leadStep = "";
let leadData = {};
const input = document.getElementById("message");
const chat = document.getElementById("chat");

const TRIAL_LINK = "https://calendar.app.google/YUyShyEXNa4DVoqcA";

function addMessage(sender, message) {
    chat.innerHTML += `
        <p><strong>${sender}:</strong> ${message}</p>
    `;
    chat.scrollTop = chat.scrollHeight;
}
async function sendMessage() {

    const question = input.value.trim();

    if (!question) return;

    addMessage("You", question);

    const q = question.toLowerCase();
    
// START LEAD CAPTURE

if (
    !leadMode &&
    (
        q.includes("join") ||
        q.includes("register") ||
        q.includes("enroll") ||
        q.includes("admission") ||
        q.includes("sign up") ||
        q.includes("interested")
    )
) {

    leadMode = true;
    leadStep = "name";

    addMessage(
        "Sauti Tamu AI",
        "Great! What is your full name?"
    );

    input.value = "";

    return;
}
// COLLECT NAME

if (leadMode && leadStep === "name") {

    leadData.name = question;
    leadStep = "phone";

    addMessage(
        "Sauti Tamu AI",
        `Thank you ${question}. Please share your phone number.`
    );

    input.value = "";

    return;
}

// COLLECT PHONE

if (leadMode && leadStep === "phone") {

    leadData.phone = question;
    leadStep = "interest";

    addMessage(
        "Sauti Tamu AI",
        `Which course are you interested in?<br><br>

🎹 Piano<br>
🎸 Guitar<br>
🎻 Violin<br>
🥁 Drums`
    );

    input.value = "";

    return;
}
// COLLECT INTEREST

if (leadMode && leadStep === "interest") {

    if (q.includes("piano")) {
    leadData.interest = "Piano";
}
else if (q.includes("guitar")) {
    leadData.interest = "Guitar";
}
else if (q.includes("violin")) {
    leadData.interest = "Violin";
}
else if (q.includes("drum")) {
    leadData.interest = "Drums";
}
else {
    leadData.interest = question;
}

    try {

        const { data, error } = await supabaseClient
            .from("leads")
            .insert([
                {
                    organization_id: "b2f35575-ff3f-4be4-85b3-c5ca90c35213",
                    name: leadData.name,
                    phone: leadData.phone,
                    interest: leadData.interest,
                    status: "New"
                }
            ]);

        if (error) {

            alert("SUPABASE ERROR: " + error.message);
            console.log(error);

        } else {

            console.log(data);

        }

    } catch (err) {

        alert("JS ERROR: " + err.message);
        console.log(err);

    }

    addMessage(
        "Sauti Tamu AI",
        `Thank you! Your details have been received.<br><br>

Course Selected: ${leadData.interest}<br><br>

<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>`
    );

    leadMode = false;
    leadStep = "";
    leadData = {};

    input.value = "";

    return;
}
    
    let answer = `
Need help choosing a course?<br><br>

🎹 Piano Lessons<br>
🎸 Guitar Lessons<br>
🎵 Free Trial Lesson<br><br>

Book here:<br>
<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>
`;

    // PRICE / COST
    if (
        q.includes("cost") ||
        q.includes("price") ||
        q.includes("fee") ||
        q.includes("fees") ||
        q.includes("discount") ||
        q.includes("payment") ||
        q.includes("payments") ||
        q.includes("installment") ||
        q.includes("instalment") ||
        q.includes("how much")
    ) {

        answer = `
Physical lessons cost KES 26,850 per instrument for 3 months.<br><br>

✅ 36 Lessons<br>
✅ 3 Lessons per Week<br>
✅ Installment Payment Available<br><br>

Book your FREE trial lesson:<br>
<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>
`;
    }

    // GUITAR
    else if (
        q.includes("guitar") ||
        q.includes("acoustic guitar") ||
        q.includes("guitar lessons") ||
        q.includes("learn guitar")
    ) {

        answer = `
🎸 Guitar Program<br><br>

✅ Duration: 3 Months<br>
✅ 36 Lessons<br>
✅ 3 Lessons per Week<br>
✅ 1 Hour per Lesson<br><br>

Fee: KES 26,850<br><br>

<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>
`;
    }

    // PIANO
    else if (
        q.includes("piano") ||
        q.includes("keyboard") ||
        q.includes("piano lessons") ||
        q.includes("learn piano")
    ) {

        answer = `
🎹 Piano Program<br><br>

✅ Duration: 3 Months<br>
✅ 36 Lessons<br>
✅ 3 Lessons per Week<br>
✅ 1 Hour per Lesson<br><br>

Fee: KES 26,850<br><br>

<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>
`;
    }

    // LOCATION
    else if (
        q.includes("location") ||
        q.includes("located") ||
        q.includes("where") ||
        q.includes("address")
    ) {

        answer = `
📍 Sauti Tamu Music School<br><br>

Junction Trade Centre<br>
Accra Road, Nairobi<br>
4th Floor Room F401<br>
Above Equity Bank Tearoom Branch
`;
    }

    // TRIAL LESSON
    else if (
        q.includes("trial") ||
        q.includes("free lesson") ||
        q.includes("book") ||
        q.includes("booking")
    ) {

        answer = `
🎵 Your First Lesson is FREE.<br><br>

Book here:<br>

<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>
`;
    }

    // LESSONS
    else if (
        q.includes("week") ||
        q.includes("lessons") ||
        q.includes("lesson")
    ) {

        answer = `
We offer 3 lessons every week.<br><br>

✅ 1 Hour per Lesson<br>
✅ 36 Lessons Total<br>
✅ Program Duration: 3 Months
`;
    }

    // KIDS PROGRAM
    else if (
        q.includes("kid") ||
        q.includes("kids") ||
        q.includes("child") ||
        q.includes("children") ||
        q.includes("holiday")
    ) {

        answer = `
🎵 Holiday Kids Program<br><br>

✅ Piano or Guitar<br>
✅ One Month Program<br><br>

Fee: KES 12,850
`;
    }
    
// FALLBACK - SAVE UNKNOWN QUESTIONS

else {

    try {

        await supabaseClient
            .from("unanswered_questions")
            .insert([
                {
                    question: question
                }
            ]);

    } catch (err) {

        console.log(err);

    }

    answer = `
I don't have a complete answer for that yet.<br><br>

Our admissions team can assist you further.<br><br>

<a href="${TRIAL_LINK}" target="_blank">
Book Trial Lesson
</a>
`;
}
    addMessage("Sauti Tamu AI", answer);

    input.value = "";
}

// ENTER KEY SUPPORT
input.addEventListener("keypress", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();
    }

});
