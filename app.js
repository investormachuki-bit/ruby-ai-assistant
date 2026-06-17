async function sendMessage() {

    const input = document.getElementById("message");
    const question = input.value.toLowerCase().trim();

    if (!question) return;

    const chat = document.getElementById("chat");

    chat.innerHTML += `
        <p><b>You:</b> ${question}</p>
    `;

    input.value = "";

    let answer = "";

    // Training Duration
    if (
        question.includes("training") ||
        question.includes("duration") ||
        question.includes("months")
    ) {

        answer = "Our training program runs for 3 Months.";

    }

    // Cost
    else if (
        question.includes("cost") ||
        question.includes("price") ||
        question.includes("fee") ||
        question.includes("charges") ||
        question.includes("how much")
    ) {

        answer = "Our full training program costs KES 15,850 after discount.";

    }

    // Lessons
    else if (
        question.includes("lesson") ||
        question.includes("week")
    ) {

        answer = "We offer 3 lessons every week, each lasting 1 hour.";

    }

    // Location
    else if (
        question.includes("location") ||
        question.includes("located") ||
        question.includes("where are you") ||
        question.includes("where")
    ) {

        answer = "Sauti Tamu Music School is located in Nairobi. Contact us for exact directions.";

    }

    // Trial Lesson
    else if (
        question.includes("trial") ||
        question.includes("book") ||
        question.includes("demo")
    ) {

        answer = "Book your trial lesson here: https://calendar.app.google/YUyShyEXNa4DVoqcA";

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

    // Trainers
    else if (
        question.includes("trainer") ||
        question.includes("teacher")
    ) {

        answer = "We have professional trainers with years of practical teaching experience.";

    }

    // Beginner
    else if (
        question.includes("beginner") ||
        question.includes("experience")
    ) {

        answer = "Yes. Our program is beginner-friendly with step-by-step learning.";

    }

    // Contact
    else if (
        question.includes("contact") ||
        question.includes("phone") ||
        question.includes("call")
    ) {

        answer = 'Book your trial lesson here: <a href="https://calendar.app.google/YUyShyEXNa4DVoqcA" target="_blank">Book Trial Lesson</a>';
    }

    // Default
    else {

        answer = 'Please contact our admissions team after booking a trial lesson: <a href="https://calendar.app.google/YUyShyEXNa4DVoqcA" target="_blank">Book Trial Lesson</a>';
    }

    chat.innerHTML += `
        <p><b>Sauti Tamu AI:</b> ${answer}</p>
    `;

    chat.scrollTop = chat.scrollHeight;
}
