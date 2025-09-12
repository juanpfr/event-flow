import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, Zap, Quote, BarChart3, HelpCircle } from "lucide-react";
import FeaturedEvents from "./FeaturedEvents";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-24 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">
              EventFlow
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Muito mais que uma plataforma de eventos. <br />
              O <span className="font-semibold text-white">EventFlow</span> é seu parceiro no planejamento, organização e participação.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-xl">
                <Link to="/login">Fazer Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-10 py-6 rounded-2xl bg-white/10 text-white border-white/20 hover:bg-white/20 shadow-lg hover:shadow-xl">
                <Link to="/register">Criar Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Tudo que você precisa em uma só plataforma
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              De pequenos encontros até grandes conferências, o <strong>EventFlow</strong> 
              atende organizadores e participantes com ferramentas práticas e eficientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Card className="card-gradient border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Gestão Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Crie, edite e acompanhe seus eventos em um dashboard intuitivo com tudo o que você precisa em um só lugar.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Participação Fácil</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Descubra eventos e garanta seu ingresso em poucos cliques. Rápido, simples e sem burocracia.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Planos Flexíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  Do gratuito ao premium, temos planos que se adaptam às suas necessidades e ao crescimento dos seus eventos.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-24 px-6 bg-muted/40">
        <div className="container max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16">O que dizem nossos usuários</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <Card className="shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <Quote className="w-8 h-8 text-primary mb-4" />
                <CardTitle>Maria Fernandes</CardTitle>
                <CardDescription>Organizadora de Conferências</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  “Com o EventFlow, conseguimos aumentar em <strong>40% o número de inscrições</strong> 
                  no nosso último evento. A plataforma simplificou toda a gestão e atraiu muito mais público.”
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <Quote className="w-8 h-8 text-primary mb-4" />
                <CardTitle>Lucas Almeida</CardTitle>
                <CardDescription>Participante Frequente</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  “Nunca foi tão fácil me inscrever em eventos. Em apenas <strong>3 cliques</strong> 
                  eu já tinha garantido minha vaga. Simples, rápido e eficiente.”
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <Quote className="w-8 h-8 text-primary mb-4" />
                <CardTitle>Ana Souza</CardTitle>
                <CardDescription>Produtora de Shows</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  “O EventFlow ajudou nossa equipe a <strong>economizar horas de trabalho</strong> 
                  e ainda melhorou a experiência dos participantes. Recomendo para qualquer produtor de eventos.”
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <FeaturedEvents />

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-muted/40">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
            Perguntas Frequentes
          </h2>

          <div className="space-y-8">
            <div className="p-6 bg-white/80 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">O EventFlow é gratuito?</h3>
              </div>
              <p className="text-muted-foreground">
                Sim! Você pode começar gratuitamente com nosso plano básico. Se precisar de recursos avançados, 
                temos planos flexíveis que se adaptam ao crescimento do seu evento.
              </p>
            </div>

            <div className="p-6 bg-white/80 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Preciso instalar algum programa?</h3>
              </div>
              <p className="text-muted-foreground">
                Não. O EventFlow é 100% online, acessível de qualquer dispositivo com internet — computador, tablet ou celular.
              </p>
            </div>

            <div className="p-6 bg-white/80 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Posso vender ingressos pelo EventFlow?</h3>
              </div>
              <p className="text-muted-foreground">
                Sim! Nossa plataforma possui integração para pagamentos online, facilitando a compra e aumentando suas vendas.
              </p>
            </div>

            <div className="p-6 bg-white/80 rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">É seguro usar o EventFlow?</h3>
              </div>
              <p className="text-muted-foreground">
                Totalmente. Seguimos boas práticas de segurança e mantemos seus dados e transações sempre protegidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-10 shadow-lg">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Pronto para transformar sua experiência?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de organizadores e participantes que já confiam no <strong>EventFlow</strong>.
            </p>
            <Button asChild size="lg" className="text-lg px-10 py-6 rounded-2xl shadow-lg hover:shadow-2xl">
              <Link to="/register">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-6 px-4 bg-black">
        <div className="container mx-auto text-center text-sm text-white">
          © {new Date().getFullYear()} EventFlow. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Home;
