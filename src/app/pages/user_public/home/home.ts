import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgFor, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  posts: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.http.get('http://localhost:3000/api/post').subscribe({
      next: (res: any) => {
        this.posts = res.slice(0, 3);
      },
      error: () => {},
    });
  }
}
