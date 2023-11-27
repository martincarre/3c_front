import { Component, OnInit } from '@angular/core';
import { ThirdpartyService } from '../../services/thirdparty.service';
import { Thirdparty } from '../../models/thirdparty.model';

@Component({
  selector: 'app-thirdpartylist',
  templateUrl: './thirdpartylist.component.html',
  styleUrls: ['./thirdpartylist.component.scss']
})
export class ThirdpartylistComponent implements OnInit{
  tpList: Thirdparty[] = [];

  constructor(
    private tpservice: ThirdpartyService,
  ) { }
  ngOnInit(): void {
    this.tpservice.getThirdparties().subscribe((data: Thirdparty[]) => {
      this.tpList = data;
    });
  }

}
