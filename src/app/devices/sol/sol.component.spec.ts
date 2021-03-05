import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { SolComponent } from './sol.component'

describe('SolComponent', () => {
  let component: SolComponent
  let fixture: ComponentFixture<SolComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SolComponent],
      providers: [{
        provide: ActivatedRoute,
        useValue:
          { snapshot: { paramMap: convertToParamMap({ id: '99-88-77' }) } }
      }]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(SolComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
