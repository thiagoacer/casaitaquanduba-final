// Função simples para converter texto iCal em datas
export function parseIcalDates(icalData: string): Date[] {
  const dates: Date[] = [];
  const lines = icalData.split('\n');
  let inEvent = false;
  let dtStart: string | null = null;
  let dtEnd: string | null = null;

  lines.forEach(line => {
    // Limpa espaços
    const cleanLine = line.trim();

    if (cleanLine === 'BEGIN:VEVENT') {
      inEvent = true;
      dtStart = null;
      dtEnd = null;
    } else if (cleanLine === 'END:VEVENT') {
      inEvent = false;
      if (dtStart && dtEnd) {
        // Processar o intervalo
        const start = parseIcalDateString(dtStart);
        const end = parseIcalDateString(dtEnd);
        
        // Adicionar todas as datas entre start e end
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
        }
      }
    } else if (inEvent) {
      if (cleanLine.startsWith('DTSTART;VALUE=DATE:')) {
        dtStart = cleanLine.split(':')[1];
      } else if (cleanLine.startsWith('DTEND;VALUE=DATE:')) {
        dtEnd = cleanLine.split(':')[1];
      }
    }
  });

  return dates;
}

function parseIcalDateString(dateStr: string): Date {
  // Formato YYYYMMDD
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

// Função para buscar o calendário (Usando Proxy para evitar bloqueio do Airbnb)
export async function fetchCalendar(url: string): Promise<string> {
  // Usamos corsproxy.io para contornar a proteção de CORS do navegador
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error('Falha ao baixar calendário');
  return await response.text();
}
