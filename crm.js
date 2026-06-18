document
.getElementById("search")
.addEventListener("keyup", loadDashboard);

async function loadDashboard() {

    const { data: stats, error: statsError } =
    await window.supabaseClient
        .from("leads")
        .select("status");

    if (statsError) {
        console.log(statsError);
        return;
    }

    let newCount = 0;
    let contactedCount = 0;
    let registeredCount = 0;

    stats.forEach(item => {

        if (item.status === "New") {
            newCount++;
        }

        if (item.status === "Contacted") {
            contactedCount++;
        }

        if (item.status === "Registered") {
            registeredCount++;
        }

    });

    document.getElementById("stats").innerHTML = `
        <h3>Dashboard</h3>
        New Leads: ${newCount}<br>
        Contacted: ${contactedCount}<br>
        Registered: ${registeredCount}
    `;

    const search =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    const { data: leads, error: leadsError } =
    await window.supabaseClient
        .from("leads")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (leadsError) {
        console.log(leadsError);
        return;
    }

    const table =
    document.getElementById("leadsTable");

    table.innerHTML = "";

    leads
    .filter(lead => {

        if (!search) return true;

        return (
            lead.name &&
            lead.name.toLowerCase().includes(search)
        );

    })
    .forEach(lead => {

        table.innerHTML += `
        <tr>
            <td>${lead.name || ""}</td>
            <td>${lead.phone || ""}</td>
            <td>${lead.interest || ""}</td>
            <td>${lead.status || "New"}</td>

            <td>

                <button
                class="contacted"
                onclick="markContacted('${lead.id}')">
                Contacted
                </button>

                <button
                class="registered"
                onclick="markRegistered('${lead.id}')">
                Registered
                </button>

                <button
                class="whatsapp"
                onclick="openWhatsApp('${lead.name}','${lead.phone}','${lead.interest}')">
                WhatsApp
                </button>

            </td>
        </tr>
        `;
    });

}

async function markContacted(id) {

    const { error } =
    await window.supabaseClient
        .from("leads")
        .update({
            status: "Contacted"
        })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadDashboard();
}

async function markRegistered(id) {

    const { error } =
    await window.supabaseClient
        .from("leads")
        .update({
            status: "Registered"
        })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadDashboard();
}

function openWhatsApp(name, phone, interest) {

    let cleanPhone =
    (phone || "").replace(/\D/g, "");

    if (cleanPhone.startsWith("0")) {
        cleanPhone =
        "254" +
        cleanPhone.substring(1);
    }

    const message =
`Hello ${name},

Thank you for your interest in ${interest} lessons at Sauti Tamu Music School.

Book your FREE trial lesson here:

https://calendar.app.google/YUyShyEXNa4DVoqcA

Regards,
Sauti Tamu Music School`;

    const url =
`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}

loadDashboard();
