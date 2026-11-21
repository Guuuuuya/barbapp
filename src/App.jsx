import { useState, useEffect, useMemo, useRef } from 'react'
import {
  User,
  LogOut,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  CreditCard,
  PlusCircle,
  X,
  ArrowRight,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'

const STORAGE_USER = 'navalha_user'
const STORAGE_APTS = 'navalha_appointments'
const STORAGE_SCHED = 'navalha_schedule'

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DIAS_AGENDA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const SERVICOS = [
  { id: 'corte', label: 'Corte Degradê / Social', preco: 45 },
  { id: 'barba', label: 'Barba Terapia / Navalha', preco: 35 },
  { id: 'sobrancelha', label: 'Sobrancelha', preco: 15 },
  { id: 'combo', label: 'Combo Corte + Barba', preco: 70 },
]

const seedUser = { nome: 'Barbeiro Navalha', email: 'barbeiro@navalha.com' }

const seedSchedule = () => {
  const s = {}
  DIAS_SEMANA.forEach((d) => {
    s[d] = { ativo: true, open: '09:00', lunchStart: '12:00', lunchEnd: '13:00', close: '19:00', blocos: [] }
  })
  return s
}

const hojeISO = () => new Date().toISOString().slice(0, 10)

const seedAppointments = () => {
  const hoje = hojeISO()
  const base = [
    { cliente: 'Carlos Silva', servicos: ['corte'], valor: 45, status: 'concluido' },
    { cliente: 'Roberto Lima', servicos: ['corte', 'barba'], valor: 70, status: 'concluido' },
    { cliente: 'Marcos Alves', servicos: ['barba'], valor: 35, status: 'pendente' },
    { cliente: 'João Pereira', servicos: ['corte', 'sobrancelha'], valor: 60, status: 'pendente' },
  ]
  const data = []
  let offset = 0
  base.forEach((a, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 3 + i)
    data.push({ ...a, id: `apt-${Date.now()}-${i}`, data: d.toISOString().slice(0, 10), horario: '09:00', criadoEm: Date.now() - offset++ })
  })
  data.push(
    { id: `apt-${Date.now()}-10`, cliente: 'Ana Costa', servicos: ['corte'], valor: 45, status: 'pendente', data: hoje, horario: '10:00', criadoEm: Date.now() },
    { id: `apt-${Date.now()}-11`, cliente: 'Pedro Rocha', servicos: ['barba'], valor: 35, status: 'concluido', data: hoje, horario: '11:00', criadoEm: Date.now() - 1 }
  )
  return data
}

export default function App() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [schedule, setSchedule] = useState({})
  const [tab, setTab] = useState('agenda')
  const [selectedDay, setSelectedDay] = useState(hojeISO())
  const [modalAgendar, setModalAgendar] = useState(false)

  // Carregar dados do localStorage (único ponto de verdade)
  useEffect(() => {
    const u = localStorage.getItem(STORAGE_USER)
    const a = localStorage.getItem(STORAGE_APTS)
    const s = localStorage.getItem(STORAGE_SCHED)
    if (u) setUser(JSON.parse(u))
    if (a) setAppointments(JSON.parse(a))
    else {
      const sData = seedAppointments()
      setAppointments(sData)
      localStorage.setItem(STORAGE_APTS, JSON.stringify(sData))
    }
    if (s) setSchedule(JSON.parse(s))
    else {
      setSchedule(seedSchedule())
      localStorage.setItem(STORAGE_SCHED, JSON.stringify(seedSchedule()))
    }
  }, [])

  // Persistir
  useEffect(() => { if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user)) }, [user])
  useEffect(() => { localStorage.setItem(STORAGE_APTS, JSON.stringify(appointments)) }, [appointments])
  useEffect(() => { localStorage.setItem(STORAGE_SCHED, JSON.stringify(schedule)) }, [schedule])

  const diaSemanaIdx = useMemo(() => {
    const d = new Date(selectedDay + 'T00:00:00')
    return isNaN(d.getTime()) ? new Date().getDay() : d.getDay()
  }, [selectedDay])
  const diaAtivo = DIAS_SEMANA[diaSemanaIdx]

  const login = (u) => { setUser(u); setTab('agenda') }
  const logout = () => { setUser(null); localStorage.removeItem(STORAGE_USER); setTab('agenda') }
  const abrirAgendar = () => { setModalAgendar(true) }
  const fecharAgendar = () => { setModalAgendar(false); setTab('agenda') }

  const restaurar = () => {
    if (!window.confirm('Restaurar dados de exemplo? Isso substituirá os agendamentos atuais.')) return
    const sData = seedAppointments()
    setAppointments(sData)
    localStorage.setItem(STORAGE_APTS, JSON.stringify(sData))
  }

  // ---------- LUCRO ----------
  const periodo = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay() + (hoje.getDay() === 0 ? -6 : 1))
    inicioSemana.setHours(0, 0, 0, 0)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    return { hoje, inicioSemana, inicioMes }
  }, [])

  const filtrarPorPeriodo = (tipo) => {
    return appointments.filter((a) => {
      if (a.status !== 'concluido') return false
      const d = new Date(a.data + 'T00:00:00')
      if (tipo === 'hoje') return d.getTime() === periodo.hoje.getTime()
      if (tipo === 'semana') return d >= periodo.inicioSemana && d <= periodo.hoje
      if (tipo === 'mes') return d >= periodo.inicioMes && d <= periodo.hoje
      return true
    })
  }

  const listaConcluidos = filtrarPorPeriodo('hoje')
  const lucroTotal = listaConcluidos.reduce((s, a) => s + a.valor, 0)
  const lucroSemana = filtrarPorPeriodo('semana').reduce((s, a) => s + a.valor, 0)
  const lucroMes = filtrarPorPeriodo('mes').reduce((s, a) => s + a.valor, 0)

  const qtdCortes = appointments.filter((a) => a.status === 'concluido' && a.servicos.includes('corte')).length
  const qtdBarbas = appointments.filter((a) => a.status === 'concluido' && (a.servicos.includes('barba') || a.servicos.includes('combo'))).length
  const concluidos = appointments.filter((a) => a.status === 'concluido')
  const ticketMedio = concluidos.length ? (concluidos.reduce((s, a) => s + a.valor, 0) / concluidos.length).toFixed(2) : '0,00'

  let corteTot = 0, barbaTot = 0
  appointments.forEach((a) => {
    if (a.status !== 'concluido') return
    if (a.servicos.includes('corte')) corteTot += a.valor
    if (a.servicos.includes('barba') || a.servicos.includes('combo')) barbaTot += a.valor
  })
  const maxG = Math.max(corteTot, barbaTot, 1)

  const servicoLabel = (id) => SERVICOS.find((s) => s.id === id)?.label || id

  const formatBR = (iso) => {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  // ---------- RENDER ----------
  if (!user) {
    return (
      <div className="phone-shell safe-top safe-bottom flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src="data:image/png;base64,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" alt="Dominus Barber" className="w-20 h-20 object-cover rounded-3xl" />
          <h1 className="text-3xl font-bold tracking-tight">Dominus Barber</h1>
          <p className="text-[#A0A0A0] text-sm">Gestão de agendamentos para barbeiros</p>
        </div>

        <div className="w-full glass-border card p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">E-mail</label>
            <input
              className="w-full bg-[#121212] border border-[#2C2C2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4A359] transition"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Senha</label>
            <input
              type="password"
              className="w-full bg-[#121212] border border-[#2C2C2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4A359] transition"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={() => login(seedUser)}
            className="btn-gold w-full py-3 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(212,163,89,0.4)]"
          >
            Entrar no Painel
          </button>
          <button
            onClick={() => login({ nome: 'Visitante', email: 'visita@demo.com' })}
            className="btn-outline w-full py-3 rounded-lg font-medium text-sm"
          >
            Entrar como Visitante (Demo)
          </button>
        </div>

        <div className="mt-6 text-xs text-[#666666] text-center">
          100% local · sem servidor · dados salvos no navegador
        </div>
      </div>
    )
  }

  return (
    <div className="phone-shell safe-top safe-bottom flex flex-col h-full">
      {/* Sair no topo */}
      <div className="px-4 py-2 flex justify-end">
        <button onClick={logout} className="text-xs text-[#A0A0A0] flex items-center gap-1 hover:text-white transition">
          <LogOut size={14} /> Sair
        </button>
      </div>

      {/* Conteúdo rolável por aba (pb maior para a barra inferior não cobrir) */}
      <div className="flex-1 overflow-y-auto p-4 pb-22">
        {tab === 'agenda' && (
          <TelaAgenda
            appointments={appointments}
            setAppointments={setAppointments}
            schedule={schedule}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            onAgendar={abrirAgendar}
            servicoLabel={servicoLabel}
            formatBR={formatBR}
            hojeISO={hojeISO}
          />
        )}
        {tab === 'agendar' && (
          <TelaAgendar
            appointments={appointments}
            setAppointments={setAppointments}
            schedule={schedule}
            setSchedule={setSchedule}
            onClose={fecharAgendar}
            SERVICOS={SERVICOS}
            hojeISO={hojeISO}
          />
        )}
        {tab === 'horarios' && (
          <TelaHorarios
            schedule={schedule}
            setSchedule={setSchedule}
            DIAS_SEMANA={DIAS_SEMANA}
          />
        )}
        {tab === 'lucro' && (
          <TelaLucro
            appointments={appointments}
            filtroInicial="hoje"
            lucroTotal={lucroTotal}
            lucroSemana={lucroSemana}
            lucroMes={lucroMes}
            qtdCortes={qtdCortes}
            qtdBarbas={qtdBarbas}
            ticketMedio={ticketMedio}
            corteTot={corteTot}
            barbaTot={barbaTot}
            maxG={maxG}
            servicoLabel={servicoLabel}
            formatBR={formatBR}
            restaurar={restaurar}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-4 pt-2 z-50 [padding-bottom:env(safe-area-inset-bottom)]">
        <div className="bg-[#1E1E1E] border-t border-[#2C2C2E] rounded-3xl px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
          {[
            { id: 'agenda', label: 'Agenda', icon: <Calendar size={20} /> },
            { id: 'agendar', label: 'Agendar', icon: <PlusCircle size={20} /> },
            { id: 'horarios', label: 'Horários', icon: <Clock size={20} /> },
            { id: 'lucro', label: 'Lucro', icon: <ArrowRight size={20} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 transition ${tab === t.id ? 'tab-active' : 'text-[#A0A0A0]'}`}
            >
              {t.icon}
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Agendar */}
      {modalAgendar && (
        <TelaAgendarModal
          appointments={appointments}
          setAppointments={setAppointments}
          schedule={schedule}
          setSchedule={setSchedule}
          onClose={fecharAgendar}
          SERVICOS={SERVICOS}
          hojeISO={hojeISO}
        />
      )}
    </div>
  )
}

/* ================= TELAS ================= */

function filtrarApts(apts, filtro, selectedDay, hoje) {
  if (filtro === 'todos') return apts
  if (filtro === 'agenda') return apts.filter((a) => a.data === selectedDay)
  if (filtro === 'hoje') return apts.filter((a) => a.data === hoje)
  if (filtro === 'semana') {
    const fim = new Date(hoje); fim.setDate(fim.getDate() + 7); fim.setHours(23, 59, 59, 999)
    const inicio = new Date(hoje); inicio.setDate(inicio.getDate() - 3)
    return apts.filter((a) => { const d = new Date(a.data); return d >= inicio && d <= fim })
  }
  if (filtro === 'mes') {
    const d = new Date(); d.setDate(1)
    return apts.filter((a) => {
      const x = new Date(a.data)
      return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth()
    })
  }
  return apts
}

function TelaAgenda({ appointments, setAppointments, schedule, selectedDay, setSelectedDay, onAgendar, servicoLabel, formatBR, hojeISO }) {
  const [localApts, setLocalApts] = useState(appointments)
  const [filtroLista, setFiltroLista] = useState('agenda') // agenda | hoje | semana | mes | todos
  const datePickerRef = useRef(null)

  const abrirSeletorData = () => {
    const el = datePickerRef.current
    if (!el) return
    try { el.showPicker() } catch { el.click() }
  }

  useEffect(() => { setLocalApts(appointments) }, [appointments])
  useEffect(() => { localStorage.setItem(STORAGE_APTS, JSON.stringify(localApts)) }, [localApts])

  const diaSemanaIdx = new Date(selectedDay + 'T00:00:00').getDay()
  const diaNome = DIAS_SEMANA[diaSemanaIdx]
  const hoje = hojeISO()

  const todos = localApts
  const apts = filtrarApts(todos, filtroLista, selectedDay, hoje).sort((a, b) => a.horario.localeCompare(b.horario))
  const qtdDia = apts.length

  const chip = (id, label) => (
    <button key={id} onClick={() => setFiltroLista(id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${filtroLista === id ? 'bg-[#D4A359] text-[#121212] border-[#D4A359]' : 'bg-[#1A1A1A] border-[#2C2C2E] text-[#A0A0A0]'}`}
    >{label}</button>
  )

  const statusCor = (s) => (s === 'concluido' ? 'text-[#2ECC71]' : 'text-[#D4A359]')
  const statusTexto = (s) => (s === 'concluido' ? 'Concluído' : 'Pendente')

  const concluirApt = (id) => {
    setLocalApts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'concluido' } : a)))
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'concluido' } : a)))
  }
  const excluirApt = (id) => {
    if (!window.confirm('Cancelar este agendamento?')) return
    setLocalApts((prev) => prev.filter((a) => a.id !== id))
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  const mudarDia = (delta) => {
    const d = new Date(selectedDay + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDay(d.toISOString().slice(0, 10))
  }

  return (
    <div className="flex flex-col h-full p-4 pb-22">
      <div className="mb-4">
        <input
          ref={datePickerRef}
          type="date"
          value={selectedDay}
          onChange={(e) => { if (e.target.value) setSelectedDay(e.target.value) }}
          className="hidden"
        />
        <button onClick={abrirSeletorData} className="flex items-center gap-2 mb-1 text-left">
          <Calendar size={18} className="text-[#D4A359]" />
          <span className="font-semibold text-sm">{diaNome}, {formatBR(selectedDay)}</span>
          <ChevronDown size={14} className="text-[#A0A0A0]" />
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Agenda</h2>
          <span className="text-xs text-[#A0A0A0] bg-[#1A1A1A] px-2 py-1 rounded border border-[#2C2C2E]">{qtdDia} atendimento(s)</span>
        </div>

        {/* Filtros: agenda, hoje, futuros, mês, todos */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {chip('agenda', 'Dia')}
          {chip('hoje', 'Hoje')}
          {chip('semana', 'Futuros')}
          {chip('mes', 'Mês')}
          {chip('todos', 'Ver todos')}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-4 pb-1 scrollbar-hide">
        {(() => {
          const inicioSemana = new Date()
          inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay()) // domingo
          return Array.from({ length: 14 }).map((_, i) => {
            const d = new Date(inicioSemana)
            d.setDate(d.getDate() + i)
            const iso = d.toISOString().slice(0, 10)
            const ativo = iso === selectedDay
            const d2 = new Date(iso)
            const label = DIAS_SEMANA[d.getDay()].slice(0, 3)
            const hoje = hojeISO()
            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(iso)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[64px] ${ativo ? 'border-[#D4A359] bg-[#2A2418] text-white' : 'border-[#2C2C2E] text-[#A0A0A0] bg-[#1A1A1A] hover:border-[#3A3A3C] hover:text-white transition'}`}
              >
                <span className="text-xs font-medium">{label}</span>
                <span className={`text-xs font-bold ${ativo ? 'text-[#D4A359]' : 'text-white'}`}>{d2.getDate()}</span>
                {iso === hoje && <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full mt-0.5" />}
              </button>
            )
          })
        })()}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {apts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#666666] text-sm">
            {filtroLista === 'agenda' ? 'Sem agendamentos para este dia.' : 'Nenhum agendamento neste período.'}
          </div>
        ) : (
          apts.map((a) => (
            <div key={a.id} className="card p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#D4A359]">{a.horario}</span>
                  <span className={`text-xs ${statusCor(a.status)}`}>{statusTexto(a.status)}</span>
                </div>
                <div className="text-base font-bold truncate">{a.cliente}</div>
                <div className="text-xs text-[#A0A0A0] mt-0.5">{a.servicos.map(servicoLabel).join(' • ')}</div>
                <div className="mt-1 text-xs font-mono text-[#D4A359]">R$ {a.valor.toFixed(2).replace('.', ',')}</div>
              </div>
              <div className="flex items-end gap-2">
                {a.status === 'pendente' ? (
                  <button
                    onClick={() => concluirApt(a.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#2ECC71]/10 border border-[#2ECC71]/30 rounded-lg text-[#2ECC71] text-xs font-bold hover:bg-[#2ECC71]/20 transition"
                  >
                    <Check size={14} /> Concluir
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#2ECC71] bg-[#2ECC71]/10 border border-[#2ECC71]/20">Concluído</span>
                )}
                <button onClick={() => excluirApt(a.id)} className="p-1.5 text-[#666666] hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onAgendar}
        className="btn-gold fixed bottom-[90px] right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(212,163,89,0.5)] z-40"
      >
        <Plus size={22} />
      </button>
    </div>
  )
}

function TelaAgendar({ appointments, setAppointments, schedule, setSchedule, onClose, SERVICOS, hojeISO }) {
  const [form, setForm] = useState({ cliente: '', servicos: [], data: hojeISO(), horario: '' })

  const diaIdx = new Date(form.data + 'T00:00:00').getDay()
  const diaNome = DIAS_SEMANA[diaIdx]
  const cfg = schedule[diaNome]
  const aptsDia = appointments.filter((a) => a.data === form.data)
  const ocupados = new Set(aptsDia.map((a) => a.horario))
  const blocos = cfg?.blocos || []

  const total = form.servicos.reduce((s, id) => s + SERVICOS.find((x) => x.id === id).preco, 0)

  const slots = useMemo(() => {
    if (!cfg || !cfg.ativo) return []
    const res = []
    const [oh, om] = cfg.open.split(':').map(Number)
    const [ch, cm] = cfg.close.split(':').map(Number)
    const [lsh, lsm] = cfg.lunchStart.split(':').map(Number)
    const [leh, lem] = cfg.lunchEnd.split(':').map(Number)
    const start = oh * 60 + om
    const end = ch * 60 + cm
    const ls = lsh * 60 + lsm
    const le = leh * 60 + lem
    for (let t = start; t + 30 <= end; t += 30) {
      if (t >= ls && t < le) continue
      const h = String(Math.floor(t / 60)).padStart(2, '0')
      const m = String(t % 60).padStart(2, '0')
      const horario = `${h}:${m}`
      const o = ocupados.has(horario)
      const b = blocos.some((x) => x.horario === horario)
      res.push({ horario, ocupado: o, bloqueado: b })
    }
    return res
  }, [form.data, cfg, ocupados, blocos])

  const toggleServico = (id) =>
    setForm((f) => {
      const tem = f.servicos.includes(id)
      return { ...f, servicos: tem ? f.servicos.filter((x) => x !== id) : [...f.servicos, id] }
    })

  const selecionar = (h) => {
    if (slots.some((s) => s.horario === h && (s.ocupado || s.bloqueado))) return
    setForm((f) => ({ ...f, horario: h }))
  }

  const salvar = () => {
    if (!form.cliente.trim() || form.servicos.length === 0 || !form.horario) {
      alert('Preencha cliente, serviços e horário.')
      return
    }
    const novo = {
      id: `apt-${Date.now()}`,
      cliente: form.cliente.trim(),
      servicos: [...form.servicos],
      valor: total,
      status: 'pendente',
      data: form.data,
      horario: form.horario,
      criadoEm: Date.now(),
    }
    const listaNova = [...appointments, novo]
    setAppointments(listaNova)
    localStorage.setItem(STORAGE_APTS, JSON.stringify(listaNova))
    setForm({ cliente: '', servicos: [], data: hojeISO(), horario: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[410px] card p-5 rounded-2xl relative h-full overflow-y-auto pb-24">
        <button onClick={onClose} className="absolute top-3 right-3 text-[#A0A0A0] hover:text-white"><X size={20} /></button>
        <h2 className="text-lg font-bold mb-4">Novo Agendamento</h2>

        <div className="space-y-3 mb-4">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Nome do cliente</label>
          <input
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            placeholder="Ex: Carlos Silva"
            className="w-full bg-[#121212] border border-[#2C2C2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4A359]"
          />
          <div className="flex items-end gap-2">
            <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Dia</label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm({ ...form, data: e.target.value })}
              className="flex-1 bg-[#121212] border border-[#2C2C2E] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A359]"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{diaNome}</span>
            <span className={`text-xs font-mono ${cfg?.ativo ? 'text-[#2ECC71]' : 'text-red-400'}`}>
              {cfg?.ativo ? 'Expediente aberto' : 'Dia de folga'}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider mb-2 block">Serviços (múltiplos)</label>
          <div className="grid grid-cols-2 gap-2">
            {SERVICOS.map((s) => {
              const sel = form.servicos.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleServico(s.id)}
                  className={`service-chip ${sel ? 'selected' : ''} p-3 text-xs font-medium`}
                >
                  {s.label} <span className="text-[10px] font-normal opacity-80 ml-1">R$ {s.preco.toFixed(2).replace('.', ',')}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider mb-2 block">Horário disponível</label>
          {!cfg || !cfg.ativo ? (
            <div className="text-xs text-red-400 text-center py-2 rounded bg-red-400/10 border border-red-400/20">Este dia está de folga.</div>
          ) : slots.length === 0 ? (
            <div className="text-xs text-[#A0A0A0] text-center py-2">Sem horários neste intervalo.</div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => {
                const sel = form.horario === s.horario
                const disabled = s.ocupado || s.bloqueado
                return (
                  <button
                    key={s.horario}
                    onClick={() => selecionar(s.horario)}
                    disabled={disabled}
                    className={`px-2 py-2 rounded text-[10px] font-bold border transition ${disabled ? 'slot-occupied' : sel ? 'slot-selected' : 'slot-available'}`}
                  >
                    {s.horario}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-2 pt-3 border-t border-[#2C2C2E] flex items-center justify-between">
          <span className="text-xs text-[#A0A0A0]">Total</span>
          <span className="text-lg font-bold text-[#D4A359]">R$ {total.toFixed(2).replace('.', ',')}</span>
        </div>

        <button
          onClick={salvar}
          disabled={!form.cliente.trim() || form.servicos.length === 0 || !form.horario}
          className="mt-4 btn-gold w-full py-3.5 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(212,163,89,0.4)] disabled:opacity-50 disabled:pointer-events-none"
        >
          Confirmar Agendamento
        </button>
      </div>
    </div>
  )
}

function TelaAgendarModal({ appointments, setAppointments, schedule, setSchedule, onClose, SERVICOS, hojeISO }) {
  // Modal é agora um componente separado renderizado dentro do fluxo principal
  return null
}

function TelaHorarios({ schedule, setSchedule, setSchedule: _, DIAS_SEMANA }) {
  const [blocoDia, setBlocoDia] = useState('Segunda')
  const [blocoHora, setBlocoHora] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_SCHED, JSON.stringify(schedule))
  }, [schedule])

  const toggleDia = (dia) => {
    setSchedule((prev) => {
      const n = { ...prev, [dia]: { ...prev[dia], ativo: !prev[dia].ativo } }
      return n
    })
  }

  const setCfg = (dia, chave, valor) => {
    setSchedule((prev) => ({ ...prev, [dia]: { ...prev[dia], [chave]: valor } }))
  }

  const addBloco = () => {
    if (!blocoHora) return
    setSchedule((prev) => {
      const n = { ...prev }
      n[blocoDia] = { ...n[blocoDia], blocos: [...(n[blocoDia].blocos || []), { horario: blocoHora }] }
      return n
    })
    setBlocoHora('')
  }

  const removerBloco = (dia, idx) => {
    setSchedule((prev) => {
      const n = { ...prev }
      n[dia].blocos = n[dia].blocos.filter((_, i) => i !== idx)
      return n
    })
  }

  const timeInput = (label, valor, chave, dia) => (
    <div className="mb-3">
      <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type="time"
        value={valor}
        onChange={(e) => setCfg(dia, chave, e.target.value)}
        className="w-full bg-[#121212] border border-[#2C2C2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4A359]"
      />
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 pb-24">
      <h2 className="text-lg font-bold mb-4">Controle de Expediente</h2>
      <p className="text-xs text-[#A0A0A0] mb-6">Defina dias de trabalho, horários e bloqueios rápidos.</p>

      <div className="space-y-4 mb-6">
        {DIAS_SEMANA.map((dia) => {
          const c = schedule[dia] || { ativo: true, open: '09:00', lunchStart: '12:00', lunchEnd: '13:00', close: '19:00', blocos: [] }
          return (
            <div key={dia} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{dia}</span>
                <button
                  onClick={() => toggleDia(dia)}
                  className={`relative w-12 h-7 rounded-full bg-${c.ativo ? '#D4A359' : '#2C2C2E'} transition focus:outline-none`}
                >
                  <span className={`absolute ${c.ativo ? 'right-2' : 'left-2'} top-0.5 w-5 h-5 bg-[#121212] rounded-full transition`}></span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {timeInput('Abertura', c.open, 'open', dia)}
                {timeInput('Encerramento', c.close, 'close', dia)}
                {timeInput('Início almoço', c.lunchStart, 'lunchStart', dia)}
                {timeInput('Fim almoço', c.lunchEnd, 'lunchEnd', dia)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card p-5 mb-6 flex-1">
        <h3 className="text-sm font-bold mb-3">Bloqueio Rápido</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={blocoDia}
              onChange={(e) => setBlocoDia(e.target.value)}
              className="w-full bg-[#121212] border border-[#2C2C2E] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A359]"
            >
              {DIAS_SEMANA.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="time"
              value={blocoHora}
              onChange={(e) => setBlocoHora(e.target.value)}
              placeholder="HH:MM"
              className="bg-[#121212] border border-[#2C2C2E] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4A359]"
            />
          </div>
          <button onClick={addBloco} className="w-full btn-outline py-2 rounded-lg font-medium text-sm">
            Bloquear Horário
          </button>
          {(schedule[blocoDia]?.blocos || []).length > 0 && (
            <div className="mt-2 space-y-1">
              {(schedule[blocoDia].blocos || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-[#A0A0A0]">
                  <span>{b.horario}</span>
                  <button onClick={() => removerBloco(blocoDia, i)} className="text-[#A0A0A0] hover:text-red-400"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-[#666666]">Os bloqueios refletem imediatamente na grade de agendamento.</p>
    </div>
  )
}

function TelaLucro({ appointments, filtroInicial, lucroTotal, lucroSemana, lucroMes, qtdCortes, qtdBarbas, ticketMedio, corteTot, barbaTot, maxG, servicoLabel, formatBR, restaurar }) {
  const [filtro, setFiltro] = useState(filtroInicial)
  const fatPorTipo = useMemo(() => {
    const by = { corte: 0, barba: 0, sobrancelha: 0, combo: 0 }
    appointments.forEach((a) => {
      if (a.status !== 'concluido') return
      a.servicos.forEach((s) => { if (s in by) by[s] = by[s] + a.valor })
    })
    return [
      { id: 'corte', label: 'Cortes', valor: by.corte, color: '#D4A359' },
      { id: 'barba', label: 'Barbas', valor: by.barba, color: '#2ECC71' },
      { id: 'sobrancelha', label: 'Sobr.', valor: by.sobrancelha, color: '#66D9EF' },
      { id: 'combo', label: 'Combos', valor: by.combo, color: '#F5A623' },
    ]
  }, [appointments])
  const pieTotal = fatPorTipo.reduce((s, x) => s + x.valor, 0)

  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay() + (hoje.getDay() === 0 ? -6 : 1)); inicioSemana.setHours(0,0,0,0)
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  const lista = appointments.filter((a) => {
    if (a.status !== 'concluido') return false
    const d = new Date(a.data + 'T00:00:00')
    if (filtro === 'hoje') return d.getTime() === hoje.getTime()
    if (filtro === 'semana') return d >= inicioSemana && d <= hoje
    if (filtro === 'mes') return d >= inicioMes && d <= hoje
    return true
  })

  const total = lista.reduce((s, a) => s + a.valor, 0)
  const labelFiltro = { hoje: 'Hoje', semana: 'Esta Semana', mes: 'Este Mês' }

  return (
    <div className="flex flex-col h-full p-4 pb-22">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Lucro</h2>
        <div className="flex gap-1 bg-[#1A1A1A] rounded-lg border border-[#2C2C2E] px-1">
          {['hoje', 'semana', 'mes'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${filtro === f ? 'bg-[#D4A359] text-[#121212]' : 'text-[#A0A0A0]'}`}
            >
              {labelFiltro[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <p className="text-xs text-[#A0A0A0]">Lucro Total ({labelFiltro[filtro]})</p>
            <p className="text-3xl font-bold text-[#D4A359]">R$ {total.toFixed(2).replace('.', ',')}</p>
          </div>
          <CreditCard size={24} className="text-[#D4A359]/40" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <MiniCard label="Cortes realizados" valor={qtdCortes} cor="#D4A359" icon={<Check size={16} />} />
        <MiniCard label="Barbas realizadas" valor={qtdBarbas} cor="#2ECC71" icon={<Check size={16} />} />
        <MiniCard label="Ticket médio" valor={'R$ ' + ticketMedio} cor="#FFFFFF" icon={<CreditCard size={16} />} />
      </div>

      <div className="card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Faturamento por Tipo de Serviço (gráfico de pizza)</h3>
        {pieTotal > 0 && <PieChart2D data={fatPorTipo} total={pieTotal} />}
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        <h3 className="text-sm font-bold mb-3">Atendimentos Concluídos</h3>
        {lista.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#666666]">Sem atendimentos concluídos neste período.</div>
        ) : (
          <div className="space-y-3">
            {lista.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-[#2C2C2E] gap-3">
                <div>
                  <div className="text-sm font-bold">{a.cliente}</div>
                  <div className="text-sm text-[#A0A0A0] mt-1">{formatBR(a.data)} • {a.servicos.map(servicoLabel).join(', ')}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#2ECC71]">R$ {a.valor.toFixed(2).replace('.', ',')}</div>
                  <div className="text-[10px] text-[#2ECC71]">Concluído</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            if (!window.confirm('Restaurar dados de exemplo? Isso substituirá os agendamentos atuais.')) return
            restaurar()
          }}
          className="text-xs text-[#A0A0A0] flex items-center justify-center gap-1 hover:text-[#D4A359] transition"
        >
          <RefreshCw size={14} /> Restaurar Dados de Exemplo
        </button>
      </div>
    </div>
  )
}

function PieChart2D({ data, total }) {
  if (total <= 0) total = 1
  const cx = 96, cy = 96, r = 84
  const pt = (a) => ({ x: cx + r * Math.cos((a - 90) * Math.PI / 180), y: cy + r * Math.sin((a - 90) * Math.PI / 180) })
  let startA = 0
  const slices = []
  data.forEach((d) => {
    if (d.valor <= 0) return
    const pct = d.valor / total
    const endA = startA + pct * 360
    const p1 = pt(startA), p2 = pt(endA)
    const large = (endA - startA) > 180 ? 1 : 0
    const path = `M ${cx} ${cy} L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`
    slices.push({ ...d, path, pct: pct * 100 })
    startA = endA
  })
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 192 192" className="w-44 h-44 max-w-full">
        {slices.map((s) => <path key={s.id} d={s.path} fill={s.color} opacity={0.88} />)}
      </svg>
      <div className="flex flex-wrap gap-3 justify-center px-2">
        {slices.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
            <span className="w-3 h-3 rounded-full border border-[#121212]" style={{ backgroundColor: s.color }}></span>
            <span className="text-white font-medium">{s.label}</span>
            <span className="font-mono font-bold text-[#D4A359]">R$ {s.valor.toFixed(2).replace('.', ',')}</span>
            <span className="text-[#A0A0A0]">{s.pct.toFixed(0)}%</span>
          </span>
        ))}
        {slices.length === 0 && <span className="text-xs text-[#666666]">Sem dados no período.</span>}
      </div>
    </div>
  )
}

function MiniCard({ label, valor, cor, icon }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#A0A0A0]">{label}</p>
        {icon && <span className={`text-[10px] ${cor === '#D4A359' ? 'text-[#D4A359]' : cor === '#2ECC71' ? 'text-[#2ECC71]' : 'text-white'}`}>{icon}</span>}
      </div>
      <p className="text-lg font-bold">{valor}</p>
    </div>
  )
}
