// lib/api.js
const api = {
  async convertAudio(formData) {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData, // <-- keep original FormData
      });

      const data = await response.json();

      // Optional: handle processing status
      if (data.status === 'processing' && data.id) {
        // Poll until done
        let finalData = data;
        while (finalData.status === 'processing') {
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await fetch(`/api/check-transcript?id=${data.id}`);
          finalData = await statusRes.json();
        }
        return finalData;
      }

      return data;
    } catch (err) {
      console.error("API Error:", err);
      return { text: "Network error", mode: "error" };
    }
  }
};

export default api;
