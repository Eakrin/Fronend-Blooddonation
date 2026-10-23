import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-news',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News implements OnInit {
  posts: any[] = [];
  isLoading = true;
  selectedPost: any = null; // ประกาศที่กดเปิดดู (โปสเตอร์ฉบับเต็ม)

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.http.get(environment.apiUrl + '/api/post').subscribe({
      next: (res: any) => {
        this.posts = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.posts = [];
        this.isLoading = false;
      },
    });
  }

  openPost(post: any) {
    this.selectedPost = post;
  }

  closePost() {
    this.selectedPost = null;
  }
}
