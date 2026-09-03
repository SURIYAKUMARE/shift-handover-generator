import { Event, SourceHealth } from '../../types/index.js';
import { SourceAdapter } from './baseAdapter.js';
import { SEED_SCENARIOS } from '../../seeds/seedData.js';

export class MockTicketingAdapter implements SourceAdapter {
  id = 'ticketing';
  name = 'Ticketing (Jira / Zendesk)';
  type: 'ticketing' = 'ticketing';
  private simulateUnreachable = false;
  private currentScenario = 'busy';

  setScenario(scenario: string) {
    this.currentScenario = scenario;
  }

  setSimulateUnreachable(unreachable: boolean) {
    this.simulateUnreachable = unreachable;
  }

  async checkHealth(): Promise<SourceHealth> {
    const startTime = Date.now();
    if (this.simulateUnreachable) {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        status: 'unreachable',
        event_count: 0,
        latency_ms: 500,
        error: 'Connection timed out (ETIMEDOUT: 504 Gateway Timeout)',
      };
    }
    const events = (SEED_SCENARIOS[this.currentScenario]?.events.ticketing || []);
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: 'connected',
      event_count: events.length,
      latency_ms: Math.max(12, Date.now() - startTime),
    };
  }

  async fetchEvents(): Promise<Event[]> {
    if (this.simulateUnreachable) {
      throw new Error('Ticketing service unreachable (ECONNREFUSED)');
    }
    // Deep clone to prevent mutations
    const events = SEED_SCENARIOS[this.currentScenario]?.events.ticketing || [];
    return JSON.parse(JSON.stringify(events));
  }
}

export class MockIncidentAdapter implements SourceAdapter {
  id = 'incident';
  name = 'Incidents (PagerDuty / OpsGenie)';
  type: 'incident' = 'incident';
  private simulateUnreachable = false;
  private currentScenario = 'busy';

  setScenario(scenario: string) {
    this.currentScenario = scenario;
  }

  setSimulateUnreachable(unreachable: boolean) {
    this.simulateUnreachable = unreachable;
  }

  async checkHealth(): Promise<SourceHealth> {
    const startTime = Date.now();
    if (this.simulateUnreachable) {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        status: 'unreachable',
        event_count: 0,
        latency_ms: 500,
        error: 'Connection reset by peer (ECONNRESET)',
      };
    }
    const events = (SEED_SCENARIOS[this.currentScenario]?.events.incident || []);
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: 'connected',
      event_count: events.length,
      latency_ms: Math.max(18, Date.now() - startTime),
    };
  }

  async fetchEvents(): Promise<Event[]> {
    if (this.simulateUnreachable) {
      throw new Error('Incident monitoring API unreachable (ECONNRESET)');
    }
    const events = SEED_SCENARIOS[this.currentScenario]?.events.incident || [];
    return JSON.parse(JSON.stringify(events));
  }
}

export class MockChatAdapter implements SourceAdapter {
  id = 'chat';
  name = 'Chat War-Rooms (Slack / Teams)';
  type: 'chat' = 'chat';
  private simulateUnreachable = false;
  private currentScenario = 'busy';

  setScenario(scenario: string) {
    this.currentScenario = scenario;
    if (SEED_SCENARIOS[scenario]?.simulateUnreachableSource === 'chat') {
      this.simulateUnreachable = true;
    } else {
      this.simulateUnreachable = false;
    }
  }

  setSimulateUnreachable(unreachable: boolean) {
    this.simulateUnreachable = unreachable;
  }

  async checkHealth(): Promise<SourceHealth> {
    const startTime = Date.now();
    if (this.simulateUnreachable) {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        status: 'unreachable',
        event_count: 0,
        latency_ms: 820,
        error: 'Slack API rate-limited / upstream 503 Service Unavailable',
      };
    }
    const events = (SEED_SCENARIOS[this.currentScenario]?.events.chat || []);
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: 'connected',
      event_count: events.length,
      latency_ms: Math.max(25, Date.now() - startTime),
    };
  }

  async fetchEvents(): Promise<Event[]> {
    if (this.simulateUnreachable) {
      throw new Error('Slack API upstream service unavailable (HTTP 503)');
    }
    const events = SEED_SCENARIOS[this.currentScenario]?.events.chat || [];
    return JSON.parse(JSON.stringify(events));
  }
}
