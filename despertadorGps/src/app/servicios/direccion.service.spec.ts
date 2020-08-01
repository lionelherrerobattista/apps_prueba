import { TestBed } from '@angular/core/testing';

import { DireccionService } from './direccion.service';

describe('DireccionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DireccionService = TestBed.get(DireccionService);
    expect(service).toBeTruthy();
  });
});
