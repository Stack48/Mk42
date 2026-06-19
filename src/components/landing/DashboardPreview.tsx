export default function DashboardPreview() {
  const primary = '#4648D4'

  return (
    <div className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] border border-[#E5E7EB] bg-white">
      {/* Browser bar */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FC5F57]" />
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FDBC2C]" />
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#25CC40]" />
        <div className="flex-1 ml-2 bg-white rounded-[5px] px-2.5 py-[3px] text-[11px] text-[#9CA3AF] border border-[#E5E7EB]">
          app.opus-btp.fr/dashboard
        </div>
      </div>

      {/* Dashboard layout */}
      <div className="flex min-h-[420px]">

        {/* Sidebar */}
        <div className="w-[180px] bg-[#F9FAFB] border-r border-[#E5E7EB] py-4 shrink-0">
          <div className="px-4 pb-4 border-b border-[#E5E7EB] mb-2">
            <span className="font-bold text-[15px] text-[#111]">Opus</span>
          </div>
          {[
            { label: 'Tableau de bord', active: true },
            { label: 'Mes Opportunités', active: false },
            { label: 'Factures', active: false },
            { label: 'Contrats', active: false },
            { label: 'Paramètres', active: false },
          ].map(item => (
            <div key={item.label} className={`px-4 py-2 text-xs cursor-default border-l-[3px] ${
              item.active
                ? 'font-semibold text-[#4648D4] bg-[#EEEEFF] border-[#4648D4]'
                : 'font-normal text-[#6B7280] bg-transparent border-transparent'
            }`}>{item.label}</div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-5 bg-white overflow-hidden">
          <p className="text-base font-bold text-[#111] mb-4">Tableau de bord</p>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Commissions', value: '2 506€' },
              { label: 'Total annuel', value: '204 850€' },
              { label: 'Apporteurs', value: '8' },
              { label: 'Documents', value: '14' },
            ].map(k => (
              <div key={k.label} className="bg-[#F9FAFB] rounded-lg px-3.5 py-3 border border-[#E5E7EB]">
                <p className="text-[10px] text-[#9CA3AF] mb-1">{k.label}</p>
                <p className="text-base font-bold text-[#111]">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Actions */}
            <div>
              <p className="text-xs font-semibold text-[#374151] mb-2.5">Actions classées</p>
              {[
              { label: 'Contrat Martin', dotCls: 'bg-[#25CC40]' },
              { label: 'DAS2 Dupont', dotCls: 'bg-[#4648D4]' },
              { label: 'Facture #124', dotCls: 'bg-[#FDBC2C]' },
            ].map(({ label: item, dotCls }, i) => (
                <div key={item} className={`flex items-center gap-2 py-[7px] ${i < 2 ? 'border-b border-[#F3F4F6]' : ''}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
                  <span className="text-[11px] text-[#374151] flex-1">{item}</span>
                  <span className="text-[10px] text-[#9CA3AF]">Aujourd&apos;hui</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <div>
              <p className="text-xs font-semibold text-[#374151] mb-2.5">Dernières transactions</p>
              {[
                { name: 'M. Martin', amount: '1 200€' },
                { name: 'Mme Bernard', amount: '850€' },
                { name: 'SCI Lebrun', amount: '3 400€' },
              ].map((t, i) => (
                <div key={t.name} className={`flex items-center justify-between py-[7px] ${i < 2 ? 'border-b border-[#F3F4F6]' : ''}`}>
                  <span className="text-[11px] text-[#374151]">{t.name}</span>
                  <span className="text-[11px] font-semibold text-[#111]">{t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
