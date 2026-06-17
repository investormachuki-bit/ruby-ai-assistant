alert("APP JS LOADED");

async function sendMessage() {

    try {

        alert("SUPABASE_URL TYPE: " + typeof SUPABASE_URL);

        alert("SUPABASE_ANON_KEY TYPE: " + typeof SUPABASE_ANON_KEY);

        alert("CLIENT TYPE: " + typeof supabaseClient);

        const { data, error } = await supabaseClient
            .from("knowledge_base")
            .select("*");

        if (error) {
            alert("SUPABASE ERROR: " + error.message);
            return;
        }

        alert("ROWS FOUND: " + data.length);

    } catch (err) {

        alert("JS ERROR: " + err.message);

    }

}
