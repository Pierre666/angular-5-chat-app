import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';

import { ServerListComponent } from './server-list.component';
import { SettingsService } from '../../services/settings.service';
import { ApiService } from '../../services/api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppStateService } from '../../services/app-state.service';
import { WebsocketService } from '../../services/websocket.service';
import ChatServer from '../../../../shared-interfaces/server.interface';

describe('ServerListComponent', () => {
  let component: ServerListComponent;
  let fixture: ComponentFixture<ServerListComponent>;
  let injector: TestBed;
  let apiService: ApiService;
  let httpMock: HttpTestingController;
  let appState: AppStateService;
  const fakeWebSocketService  = {
    socket: {
      emit: jasmine.createSpy()
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerListComponent],
      providers: [
        SettingsService,
        ApiService,
        AppStateService,
        { provide: WebsocketService, useValue: fakeWebSocketService },
      ],
      imports: [HttpClientTestingModule],
    })
      .compileComponents();
    injector = getTestBed();
    apiService = injector.get(ApiService);
    appState = injector.get(AppStateService);
    httpMock = injector.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });
  it('request server list succeeds', () => {
    const mockResponse = { servers: [{ name: 'server1' }] };
    const called = httpMock.expectOne(`${apiService.BASE_URL}server`);
    called.flush(mockResponse);
    expect(component.serverList).toEqual(mockResponse.servers);
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual(null);
    httpMock.verify();
  });
  it('request server list fails', () => {
    const mockResponse = { servers: [{ name: 'server1' }] };
    const called = httpMock.expectOne(`${apiService.BASE_URL}server`);
    called.flush(mockResponse, { status: 500, statusText: 'Server Error' });
    expect(component.serverList).toEqual(undefined);
    expect(component.loading).toEqual(false);
    expect(component.error).toEqual('Unable to retrieve server list.');
    httpMock.verify();
  });
  it('joins server', () => {
    const server: ChatServer = {
      name: 'test-server',
      id: '12345',
      owner_id: 'asd123',
    };
    component.joinServer(server);
    expect(appState.currentServer).toEqual(server);
    expect(fakeWebSocketService.socket.emit).toHaveBeenCalledWith('join-server', server.id);
  });
});
