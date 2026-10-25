import './PrivacyPolicyRoute.css'

export function PrivacyPolicyRoute() {
  return (
    <section className="privacy-policy-section">
      <article className="privacy-policy">
        <header className="privacy-policy-header">
          <p className="privacy-policy-eyebrow">enem prep · seus dados</p>
          <h1>Política de Privacidade</h1>
          <p className="privacy-policy-updated"><strong>Última atualização:</strong> 25 de outubro de 2026</p>
        </header>

      <p className="privacy-policy-intro">
        Esta Política de Privacidade explica como enem.thiguima.online
        trata informações durante o uso da plataforma. Nosso objetivo é
        respeitar a privacidade dos usuários, coletar apenas as informações
        necessárias para as finalidades descritas e observar a legislação
        aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais
        (LGPD — Lei nº 13.709/2018).
      </p>

      <h2>1. Dados armazenados no seu dispositivo</h2>

      <p>
        O aplicativo utiliza o armazenamento local do navegador
        (<code>localStorage</code>) para guardar informações relacionadas
        à sua experiência de estudo. Esses dados podem incluir:
      </p>

      <ul>
        <li>Identificadores das questões respondidas;</li>
        <li>Questões marcadas como favoritas;</li>
        <li>Histórico de tentativas de resposta;</li>
        <li>Alternativas selecionadas em cada tentativa;</li>
        <li>Indicação de acerto ou erro;</li>
        <li>Data e horário registrados para cada tentativa.</li>
      </ul>

      <p>
        Essas informações permitem que o aplicativo mantenha suas
        preferências e seu histórico de estudo entre visitas.
      </p>

      <p>
        Os dados armazenados no <code>localStorage</code> permanecem
        no navegador e não são automaticamente transmitidos aos nossos
        servidores. A transmissão depende das funcionalidades utilizadas
        e da implementação do aplicativo.
      </p>

      <p>
        As informações podem continuar armazenadas após o fechamento
        do navegador. Você pode removê-las limpando os dados do site
        nas configurações do navegador, embora isso possa apagar seu
        histórico de estudo e suas preferências.
      </p>

      <p>
        Pessoas com acesso ao seu dispositivo ou ao seu perfil do
        navegador também podem conseguir acessar esses dados.
        Recomendamos cuidado ao utilizar dispositivos compartilhados.
      </p>

      <h2>2. Estatísticas de utilização — Umami Cloud</h2>

      <p>
        Utilizamos o Umami Cloud para compreender como a plataforma
        é utilizada, avaliar a popularidade de suas funcionalidades
        e orientar melhorias.
      </p>

      <p>As informações processadas podem incluir:</p>

      <ul>
        <li>Páginas acessadas e endereços das páginas visitadas;</li>
        <li>Origem das visitas e páginas de referência;</li>
        <li>Eventos de interação, como cliques em botões;</li>
        <li>Tipo de navegador, sistema operacional e dispositivo;</li>
        <li>Resolução da tela e idioma do navegador;</li>
        <li>Localização geográfica aproximada, como país ou região.</li>
      </ul>

      <p>
        O Umami não utiliza cookies de rastreamento por padrão.
        Entretanto, seu funcionamento pode envolver o processamento
        do endereço IP para estimar a localização e gerar identificadores
        de sessão pseudonimizados. A ausência de cookies não significa,
        por si só, que todos os dados tratados sejam anônimos.
      </p>

      <p>
        Utilizamos essas estatísticas para analisar tendências gerais
        de utilização e identificar oportunidades de melhoria.
        Não pretendemos utilizar os dados analíticos para identificar
        pessoalmente os visitantes.
      </p>

      <p>
        Os eventos personalizados são configurados para evitar o envio
        de informações pessoais, conteúdo das respostas ou outros dados
        sensíveis. O histórico de tentativas e as questões favoritas
        armazenados localmente não são intencionalmente enviados ao
        Umami. Essa prática depende da implementação dos eventos
        e da configuração efetivamente utilizada.
      </p>

      <p>
        As informações analíticas são processadas pelo Umami Cloud
        conforme as condições do serviço e as configurações aplicáveis.
        A retenção e a localização dos dados dependem da infraestrutura
        e das políticas do fornecedor.
      </p>

      <p>
        Para mais informações, consulte a 
        <a href="https://umami.is/terms"
          target="_blank"
          rel="noopener noreferrer">
          Política de Privacidade do Umami
        </a>.
      </p>

      <h2>3. Relatos de problemas — Forminit</h2>

      <p>
        Disponibilizamos um formulário para que você possa comunicar
        erros, inconsistências ou outros problemas encontrados nas
        questões e funcionalidades da plataforma.
      </p>

      <p>
        Quando você envia um relato, as informações preenchidas são
        transmitidas ao Forminit e armazenadas em sua infraestrutura
        para que possamos receber, analisar e resolver o problema.
      </p>

      <p>As informações enviadas podem incluir:</p>

      <ul>
        <li>Categoria do problema relatado;</li>
        <li>Descrição fornecida pelo usuário;</li>
        <li>Identificador da questão, caso seja incluído no formulário;</li>
        <li>Outros campos disponibilizados no formulário.</li>
      </ul>

      <p>
        Solicitamos que você não inclua senhas, dados pessoais
        desnecessários ou informações confidenciais no relato.
      </p>

      <p>
        Os relatos são utilizados para investigar e corrigir problemas
        comunicados pelos usuários. O acesso às submissões deve ser
        limitado às pessoas que precisam analisá-las.
      </p>

      <p>
        O Forminit informa que os dados de formulários são armazenados
        na infraestrutura da Amazon Web Services localizada na Irlanda,
        com criptografia em trânsito e em repouso. A localização e as
        condições aplicáveis devem ser confirmadas conforme o serviço
        e o plano efetivamente utilizados.
      </p>

      <p>
        A retenção depende das configurações do serviço. No plano
        gratuito, as submissões podem permanecer armazenadas até
        serem excluídas manualmente, conforme as condições informadas
        pelo fornecedor. Cópias de segurança podem permanecer por
        períodos adicionais.
      </p>

      <p>
        Para mais informações, consulte a
        <a href="https://forminit.com/"
          target="_blank"
          rel="noopener noreferrer">
          página oficial do Forminit
        </a>
        e sua política de privacidade.
      </p>

      <h2>4. Hospedagem e infraestrutura — Cloudflare</h2>

      <p>
        A aplicação é hospedada no Cloudflare Pages. A infraestrutura
        utilizada para disponibilizar o site pode processar informações
        técnicas necessárias à entrega do conteúdo, à segurança,
        à prevenção de abusos e ao funcionamento do serviço.
      </p>

      <p>
        Dependendo da configuração e dos serviços utilizados, essas
        informações podem incluir endereços IP, registros técnicos
        de requisições e dados relacionados à segurança e ao desempenho.
        A coleta efetiva depende dos recursos habilitados e das políticas
        de retenção aplicáveis.
      </p>

      <p>
        Para mais informações, consulte a
        <a href="https://www.cloudflare.com/privacypolicy/"
          target="_blank"
          rel="noopener noreferrer">
          Política de Privacidade da Cloudflare
        </a>.
      </p>

      <h2>5. Finalidades e bases legais</h2>

      <p>As informações descritas nesta política podem ser tratadas para:</p>

      <ul>
        <li>Manter as funcionalidades e preferências do aplicativo;</li>
        <li>Preservar o histórico de estudo no dispositivo;</li>
        <li>Compreender o uso geral da plataforma;</li>
        <li>Identificar erros e melhorar a experiência do usuário;</li>
        <li>Receber e resolver relatos de problemas;</li>
        <li>Proteger a segurança e a integridade do serviço;</li>
        <li>Cumprir obrigações legais ou regulatórias aplicáveis.</li>
      </ul>

      <p>
        Quando houver tratamento de dados pessoais, a atividade será
        fundamentada em uma hipótese legal aplicável da LGPD, conforme
        sua finalidade e suas circunstâncias. A base legal pode variar
        entre as atividades e deverá ser determinada pelo responsável
        pelo aplicativo.
      </p>

      <h2>6. Compartilhamento e transferências internacionais</h2>

      <p>
        Utilizamos fornecedores externos para disponibilizar determinadas
        funcionalidades, incluindo:
      </p>

      <ul>
        <li><strong>Umami Cloud:</strong> análise estatística de utilização;</li>
        <li><strong>Forminit:</strong> recebimento e armazenamento de relatos;</li>
        <li><strong>Cloudflare Pages:</strong> hospedagem e entrega da aplicação.</li>
      </ul>

      <p>
        Esses fornecedores podem tratar informações necessárias à
        prestação de seus serviços. Não comercializamos dados pessoais
        dos usuários.
      </p>

      <p>
        Informações podem ser divulgadas quando exigido por lei,
        por ordem judicial ou por autoridade competente, observados
        os requisitos legais aplicáveis.
      </p>

      <p>
        Alguns fornecedores podem processar dados fora do Brasil.
        Quando houver transferência internacional de dados pessoais,
        serão observados os requisitos previstos na LGPD e nas normas
        aplicáveis da Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>7. Retenção e exclusão</h2>

      <p>
        Os dados mantidos no <code>localStorage</code> permanecem
        no dispositivo até serem removidos pelo usuário, pelo aplicativo
        ou pela limpeza dos dados do site.
      </p>

      <p>
        Os dados analíticos são mantidos conforme as configurações
        de retenção do Umami Cloud e as necessidades aplicáveis
        à operação do serviço.
      </p>

      <p>
        Os relatos enviados pelo Forminit são mantidos de acordo com
        as configurações do serviço, as necessidades de análise e
        resolução dos problemas e eventuais obrigações legais.
      </p>

      <p>
        Quando os dados pessoais deixarem de ser necessários e não
        houver fundamento legal para sua conservação, serão eliminados
        ou tratados conforme as alternativas permitidas pela legislação.
        Cópias de segurança e registros técnicos podem ter prazos
        adicionais de exclusão, conforme as condições dos fornecedores.
      </p>

      <h2>8. Segurança das informações</h2>

      <p>
        Adotamos medidas técnicas e organizacionais razoáveis para
        proteger as informações contra acesso não autorizado, perda,
        alteração, divulgação indevida ou outras formas de tratamento
        inadequado.
      </p>

      <p>
        O acesso aos relatos enviados e aos sistemas administrativos
        deve ser restrito às pessoas autorizadas. Os dados armazenados
        no navegador também dependem das medidas de segurança do
        dispositivo utilizado.
      </p>

      <p>
        Nenhum sistema de armazenamento ou transmissão pode garantir
        segurança absoluta.
      </p>

      <h2>9. Direitos dos titulares de dados</h2>

      <p>
        Nos termos da LGPD, quando aplicável, você pode exercer os
        direitos previstos na legislação, incluindo:
      </p>

      <ul>
        <li>Confirmação da existência de tratamento de dados pessoais;</li>
        <li>Acesso aos dados pessoais tratados;</li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>
          Anonimização, bloqueio ou eliminação de dados desnecessários,
          excessivos ou tratados em desconformidade com a legislação;
        </li>
        <li>
          Eliminação de dados tratados com consentimento, ressalvadas
          as hipóteses legais de conservação;
        </li>
        <li>Informações sobre entidades com as quais há compartilhamento;</li>
        <li>
          Revogação do consentimento, quando essa for a base legal
          aplicável, observadas as consequências previstas em lei;
        </li>
        <li>Demais direitos previstos na legislação aplicável.</li>
      </ul>

      <p>
        Para exercer esses direitos, entre em contato pelo endereço
        informado na seção de contato. Poderemos solicitar informações
        razoáveis para confirmar sua identidade e proteger seus dados.
      </p>

      <p>
        Os dados armazenados exclusivamente no seu navegador podem
        ser removidos por você nas configurações do navegador.
        A exclusão local não implica necessariamente a exclusão de
        informações que tenham sido enviadas separadamente a serviços
        de terceiros.
      </p>

      <h2>10. Crianças e adolescentes</h2>

      <p>
        A utilização da plataforma por crianças e adolescentes deve
        observar a legislação aplicável e o melhor interesse de crianças
        e adolescentes, quando pertinente.
      </p>

      <h2>11. Alterações nesta política</h2>

      <p>
        Esta Política de Privacidade poderá ser atualizada para refletir
        mudanças nas funcionalidades, nos fornecedores utilizados,
        nas práticas de tratamento de dados ou nas obrigações legais.
      </p>

      <p>
        A versão vigente será disponibilizada nesta página, com a
        respectiva data de atualização.
      </p>
      </article>
    </section>
  )
}
