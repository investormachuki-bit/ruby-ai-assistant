const input = document.getElementById("message");
const chat = document.getElementById("chat");

const TRIAL_LINK = "https://calendar.app.google/YUyShyEXNa4DVoqcA";

function addMessage(sender, message) {
    chat.innerHTML += `
        <p><strong>${sender}:</strong> ${message}</p>
    `;
    chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {

    const question = input.value.trim();

    if (!question) return;

    addMessage("You", question);

    const q = question.toLowerCase();

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
