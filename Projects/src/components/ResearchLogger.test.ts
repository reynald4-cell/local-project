import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  loadObservationDraft,
  persistObservationDraft,
  type ObservationDraft,
} from './ResearchLogger';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const createDraft = (notes: string): ObservationDraft => ({
  version: 1,
  updatedAt: '2026-09-25T12:00:00.000Z',
  fields: {
    title: 'Del Carmen survey',
    speciesId: 'rhizophora_mucronata',
    treeTagId: '',
    waterwayZone: 'seaward_fringe',
    waterwayName: 'Sugba Lagoon',
    lat: 9.8722,
    lng: 125.9683,
    salinityPpt: 33,
    canopyCoverPercent: 85,
    sedimentType: 'fine_mud',
    selectedWildlife: ['Mud Crabs (Alimango)'],
    trashLevel: 'none',
    erosionRisk: 'low',
    restorationAction: 'Routine health survey',
    propagulesPlantedCount: 0,
    notes,
    guideName: 'Kuya Dan',
    photoUrl: null,
  },
});

test('recovers the last known-good draft when the primary record is corrupt', () => {
  const storage = new MemoryStorage();
  persistObservationDraft(createDraft('first autosave'), storage);
  persistObservationDraft(createDraft('latest autosave'), storage);
  storage.setItem('MANGROVE_OBSERVATION_DRAFT_V1', '{"version":1');

  const recovered = loadObservationDraft(storage);

  assert.equal(recovered?.fields.notes, 'first autosave');
  assert.equal(
    JSON.parse(storage.getItem('MANGROVE_OBSERVATION_DRAFT_V1') ?? '{}').fields.notes,
    'first autosave'
  );
});

test('rejects malformed timestamps and out-of-range field values', () => {
  const storage = new MemoryStorage();
  const invalidDraft = createDraft('invalid');
  invalidDraft.updatedAt = '2026-02-31T12:00:00.000Z';
  invalidDraft.fields.propagulesPlantedCount = 100001;
  storage.setItem('MANGROVE_OBSERVATION_DRAFT_V1', JSON.stringify(invalidDraft));

  assert.equal(loadObservationDraft(storage), null);
  assert.equal(storage.getItem('MANGROVE_OBSERVATION_DRAFT_V1'), null);
});
