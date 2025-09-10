import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, Zap } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              EventFlow
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              A plataforma completa para organizar e participar dos melhores eventos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link to="/login">Fazer Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link to="/register">Criar Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Seja organizando eventos ou participando, o EventFlow oferece todas as ferramentas necessárias
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Gestão Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Crie, edite e gerencie seus eventos com facilidade. Dashboard intuitivo para organizadores.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Participação Fácil</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Descubra eventos incríveis e garante seu ingresso com poucos cliques.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Planos Flexíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Escolha o plano ideal para seus eventos. Do básico ao premium, temos a solução perfeita.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de organizadores e participantes que já confiam no EventFlow
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/register">Criar Conta Grátis</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;