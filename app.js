alert("RUBY AI READY");

async function sendMessage() {

    const input = document.getElementById("message");
    const question = input.value.toLowerCase().trim();

    if (!question) return;

    const chat = document.getElementById("chat");

    chat.innerHTML += `
        <p><b>You:</b> ${question}</p>
    `;

    input.value = "";

    try {

        const { data, error } = await supabaseClient
            .from("knowledge_base")
            .select("*");

        if (error) {

            chat.innerHTML += `
                <p><b>Assistant:</b> Error loading knowledge base.</p>
            `;

            return;
        }

        let answer = "";

        // Training Duration
        if (
            question.includes("training") ||
            question.includes("duration") ||
            question.includes("months")
        ) {

            answer = "Our training program runs for 3 Months.";

        }

        // Lessons
        else if (
            question.includes("lesson") ||
            question.includes("week")
        ) {

            answer = "We offer 3 lessons every week, each lasting 1 hour.";

        }

        // Trial Lesson
        else if (
            question.includes("trial") ||
            question.includes("book") ||
            question.includes("demo")
        ) {

            answer = "Book your trial lesson here: https://calendar.app.google/YUyShyEXNa4DVoqcA";

        }

        // Trainers
        else if (
            question.includes("trainer") ||
            question.includes("teacher")
        ) {

            answer = "We have professional trainers offering practical hands-on lessons.";

        }

        // Beginner
        else if (
            question.includes("beginner") ||
            question.includes("experience")
        ) {

            answer = "Yes. Our program is beginner-friendly with step-by-step learning.";

        }

        // Piano
        else if (
            question.includes("piano")
        ) {

            answer = "We offer professional piano training for beginners and advanced students.";

        }

        // Guitar
        else if (
            question.includes("guitar")
        ) {

            answer = "We offer professional guitar training with practical hands-on lessons.";

        }

        // Default Response
        else {

            answer = "Thank you for your question. Please book a trial lesson here: https://calendar.app.google/YUyShyEXNa4DVoqcA";

        }

        chat.innerHTML += `
            <p><b>Sauti Tamu AI:</b> ${answer}</p>
        `;

    } catch (err) {

        chat.innerHTML += `
            <p><b>Error:</b> ${err.message}</p>
        `;

    }

}
